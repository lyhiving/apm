/**
 * 图片热区渲染
 * 注：渲染设计状态下图片热区
 * @author 邦彦<bangyan@taobao.com>
 */
define(function (require) {

	var $ = require('jquery');
	var mustache = require('mustache');
	var template = require('template');
	var page = require('page');

	return {

		// 框选创建热区
		__select: function (wrap) {

			var self = this,
				doc = $(document),
				mask = $('<div class="press-area-mask" title="按住鼠标左键拖选图片区域" style="display:none"></div>'),
				select = $('<span class="press-area-select">' +
					'   <span class="press-area-border"></span>' +
					'</span>'),
				area = $('<a class="press-area-item"></a>'),
				parent = {
					left: wrap.offset().left,
					top: wrap.offset().top,
					width: wrap.width(),
					height: wrap.height()
				},
				selecting = false;

			// 创建遮挡层
			wrap.append(mask.fadeIn('fast', function () {
				$(this).show();
			}));

			// 鼠标按下准备框选
			wrap.on('mousedown.select', function (e) {

				e.preventDefault();
				select.css({
					left: e.pageX - parent.left,
					top: e.pageY - parent.top,
					width: 0,
					height: 0
				});
				$(this).append(select);
				selecting = true;

			});

			// 鼠标移动开始框选
			doc.on('mousemove.select', function (e) {

				var offset = select.offset(),
					position = select.position();

				e.preventDefault();
				select.css({
					width: Math.min(e.pageX - offset.left + 1, parent.width - position.left),
					height: Math.min(e.pageY - offset.top + 1, parent.height - position.top)
				});

			});

			// 鼠标放开结束框选
			doc.on('mouseup.select', function (e) {

				e.preventDefault();

				// 如果在指定区域内拖动
				if (!selecting) {
					return;
				}

				// 创建热区
				self.__build(area);
				area.attr({
					href: '#',
					target: '_blank',
					title: ''
				});
				area.css({
					left: select.position().left,
					top: select.position().top,
					width: Math.max(select.width()),
					height: Math.max(select.height())
				});
				wrap.append(area);

				// 移除框选
				mask.fadeOut('fast', function () {
					$(this).remove();
				});
				select.remove();

				// 解除选区绑定
				wrap.unbind('mousedown.select');
				$(this).unbind('mousemove.select');
				$(this).unbind('mouseup.select');

			});

		},

		// 构建渲染热区节点
		__build: function (area) {

			var self = this,
				attr = self.__attr(area), form;

			// 创建编辑表单
			area.append(mustache.render(template.TEMPLATE_AREA_ITEM, attr));
			form = area.find('.press-area-form');

			// 拖动和缩放
			area.jqDrag('.press-area-border').jqResize('.press-area-resize');
			area.on('jqDnRstart', function () {
				if (area.children('img').length > 0) {
					var img = area.find('img');
					area.css({
						'max-width': img.width(),
						'max-height': img.height()
					});
				}
			});

			// 禁止热区默认事件
			area.on('click', function (e) {
				var type = e.target.type;
				if (type !== 'submit' && type !== 'file') {
					e.preventDefault();
				}
			});

			// 编辑热区
			area.on('click', '.press-area-edit', function () {
				area.siblings().find('.press-area-form').hide();
				form.fadeToggle('fast');
				self.__reset(area);
			});

			// 删除热区
			area.on('click', '.press-area-remove', function () {
				confirm('确定要删除热区吗？') && area.remove();
			});

			// 确定热区编辑数据
			form.on('submit', function (e) {
				e.preventDefault();
				form.fadeOut('fast', function () {
					self.__edit(area);
				});
			});

			// 取消热区编辑表单
			area.on('click', '.press-button-gray', function () {
				form.fadeOut('fast');
			});

			// 恢复字段全选功能，防止和拖拽功能冲突
			form.on('keyup', '.press-form-text', function (e) {
				if (e.ctrlKey && e.keyCode === 65) {
					$(this).select();
				}
			});

		},

		// 获取热区参数
		__attr: function (area) {

			var pos = area.position();
			return {
				href: area.attr('href'),
				target: area.attr('target'),
				title: area.attr('title'),
				img: area.find('img').attr('src'),
				left: pos.left,
				top: pos.top,
				width: area.width(),
				height: area.height()
			};

		},

		// 重设热区编辑表单
		__reset: function (area) {

			var form = area.find('.press-area-form'),
				attr = this.__attr(area),
				index = attr.target === '_blank' ? 0 : 1;

			// 以此设置表单数据
			form.find('.press-area-field-href').val(attr.href);
			form.find('.press-area-field-target').val(attr.target);
			form.find('.press-area-field-target').attr('selectedIndex', index);
			form.find('.press-area-field-title').val(attr.title);
			form.find('.press-area-field-img').val(attr.img);

		},

		// 回写热区编辑表单数据
		__edit: function (area) {

			var form = area.find('.press-area-form'),
				href = form.find('.press-area-field-href').val(),
				target = form.find('.press-area-field-target').val(),
				title = form.find('.press-area-field-title').val(),
				img = form.find('.press-area-field-img').val();

			// 设置链接图片
			if ($.trim(img)) {
				if (area.children('img').length === 0) {
					area.prepend('<img src="' + $.trim(img) + '" alt="">');
				} else {
					area.find('img').attr('src', $.trim(img));
				}
			} else {
				area.children('img').remove();
			}

			// 设置链接属性
			area.attr({
				href: $.trim(href),
				target: $.trim(target),
				title: $.trim(title)
			});

		},

		// 获取设置对话框内容
		__getContent: function (module) {

			var img = module.find('.press-area-wrap').children('img').attr('src'),
				bgcolor = module.css('background-color'),
				bgimg = module.css('background-image'),
				hex = function (x) {
					return ('0' + parseInt(x).toString(16)).slice(-2);
				};

			// 格式化背景颜色
			bgcolor = bgcolor.match(/^rgb?\((\d+),\s*(\d+),\s*(\d+)\)$/);
			bgcolor = bgcolor ? '#' + hex(bgcolor[1]) + hex(bgcolor[2]) + hex(bgcolor[3]) : bgcolor;

			// 格式化背景图片
			bgimg = bgimg !== 'none' ? bgimg.replace(/^url\(["']?/, '').replace(/["']?\)$/, '') : '';

			return $(mustache.render(template.TEMPLATE_AREA_OPTION, {
				img: img ? img : '',
				bgcolor: bgcolor ? bgcolor.toUpperCase() : '',
				bgimg: bgimg ? bgimg : ''
			}));

		},

		// 回写设置选项数据
		__reflow: function (module) {

			var wrap = module.find('.press-area-wrap'),
				trigger = wrap.children('img'),
				img = $('.press-area-option-img').val(),
				bgcolor = $('.press-area-option-bgcolor').val(),
				bgimg = $('.press-area-option-bgimg').val();

			// 等待主图加载，并重置容器尺寸
			var onload = function (trigger) {
				page.loading();
				return trigger.load(function () {
					wrap.css({
						width: trigger.width(),
						height: trigger.height()
					});
					page.unloading();
				});
			};

			// 设置热区容器、主图
			if ($.trim(img)) {
				if (trigger.length === 0) {
					trigger = $('<img src="' + $.trim(img) + '" alt="">');
					wrap.append(onload(trigger));
				} else {
					img = $.trim(img);
					trigger.attr('src') !== img && onload(trigger).attr('src', img);
				}
			} else {
				wrap.children('img').remove();
			}

			// 设置背景颜色、背景图片
			module.css({
				'background-color': bgcolor ? $.trim(bgcolor) : '',
				'background-image': bgimg ? 'url(' + $.trim(bgimg) + ')' : 'none'
			});

		},

		// 创建设置对话框
		__create: function (module) {

			// 配置参数
			var self = this;

			// 配置对话框
			$.overlay({
				title: '设置模块图片',
				content: function () {
					return self.__getContent(module);
				},
				ok: '设置好了，看看效果',
				onOk: function () {
					$('.press-area-option-submit').trigger('click');
				},
				afterRenderUI: function (container, close) {
					$('.press-area-option-form').on('submit', function (e) {
						e.preventDefault();
						self.__reflow(module);
						close();
					});
				},
				type: 'small'
			});

		},

		// 简易图片上传功能
		__upload: function (file, callback) {

			var formdata = new FormData();

			//设置参数
			formdata.append('nick', press.nick);
			formdata.append('session_id', new Date().getTime());
			formdata.append('photo', file);

			$.ajax({
				dataType: 'json',
				// todo
				url: '../tests/upload.php',
				type: 'post',
				data: formdata,
				processData: false,
				contentType: false,
				success: function (d) {
					if (d.status === '1') {
						callback(d.url);
					} else {
						alert(d.msg);
					}
				}
			});

		},

		// 绑定热区操作
		__bind: function () {

			var self = this, doc = $(document);

			// 图片选项
			doc.on('click', '.press-area-option', function () {

				var module = $(this).parents('.J_Module').find('.press-area');
				self.__create(module);

			});

			// 图片上传
			doc.on('change', '.press-area-file input', function (e) {

				var text = $(this).parents('.press-area-file').siblings('.press-form-text');
				self.__upload(e.currentTarget.files[0], function (url) {
					text.val(url);
				});

			});

			// 添加热区
			doc.on('click', '.press-area-add', function () {

				var wrap = $(this).parents('.J_Module').find('.press-area-wrap');
				if (wrap.children('.press-area-mask').length === 0) {
					self.__select(wrap);
				}

			});

			// 保存所有热区
			doc.on('click', '.press-area-save', function () {

				var wrap = $(this).parents('.J_Module').find('.press-area');
				self.__setAreas(wrap);

			});

		},

		// 保存所有热区
		__setAreas: function (module) {

			var self = this,
				list = [];
			module.find('.press-area-item').each(function (k, v) {
				list.push(self.__attr($(v)));
			});

			// 保存至后端的数据
			$.ajax({
				type: 'post',
				// todo
				url: '../tests/setAreas.php',
				data: {
					page: press.page,
					guid: module.parents('.J_Module').attr('data-guid'),
					data: JSON.stringify({
						'option': '',
						'list': list
					}),
					_input_charset: 'utf-8'
				},
				beforeSend: function () {
					page.loading();
				},
				complete: function () {
					page.unloading();
				},
				success: function (d) {
					if (d.code === '200') {
						page.message(d.message);
					} else {
						alert(d.message);
					}
				},
				dataType: 'json'
			});

		},

		// 设置原始热区
		render: function (module) {

			var self = this,
				_module = module ? $(module) : $('.press-area');

			// 遍历并渲染原始热区
			_module.find('.press-area-item').each(function (k, v) {
				self.__build($(v));
			});

		},

		// 初始化
		init: function () {

			this.render();
			this.__bind();

		}

	};

});