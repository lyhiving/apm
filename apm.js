/**
 * 热区组件
 * @author 邦彦<bangyan@taobao.com>
 */
(function ($) {

	// 节点模板
	var TEMPLATE_AREA_ITEM = '<span class="apm-area-border"></span>' +
		'<span class="apm-area-resize"></span>' +
		'<span class="apm-area-action">' +
		'	<span class="apm-area-edit" title="编辑"><i class="apm-icon apm-icon-pencil"></i></span>' +
		'	<span class="apm-area-remove" title="删除"><i class="apm-icon apm-icon-remove"></i></span>' +
		'</span>' +
		'</span>' +
		'<form class="apm-base apm-form apm-form-mini apm-area-form">' +
		'	<span class="apm-form-field" title="链接到">' +
		'		<select class="apm-form-select apm-area-field-href" required="required">' +
		'		    <option value="test.jpg">test.jpg</option>' +
		'       </select>' +
		'	</span>' +
		'	<span class="apm-form-field" title="切换效果">' +
		'		<select class="apm-form-select apm-area-field-transition" required="required">' +
		'			<option value="slide">滑动</option>' +
		'			<option value="slideUp">向上滑动</option>' +
		'			<option value="slideDown">向下滑动</option>' +
		'			<option value="pop">抛出</option>' +
		'			<option value="fade">淡入淡出</option>' +
		'			<option value="flip">立体翻转</option>' +
		'		</select>' +
		'	</span>' +
		'	<span class="apm-form-field" title="标题（可选）">' +
		'		<input class="apm-form-text apm-area-field-title" type="text" value="{{title}}" placeholder="标题（可选）">' +
		'	</span>' +
		'	<span class="apm-form-field apm-clearfix">' +
		'		<button class="apm-button apm-button-red apm-button-small" type="submit">确定</button>' +
		'		<button class="apm-button apm-button-gray apm-button-small" type="button">取消</button>' +
		'	</span>' +
		'</form>';

	var apm = {

		// 框选创建热区
		__select: function (container) {

			var self = this,
				doc = $(document),
				mask = $('<div class="apm-area-mask" title="按住鼠标左键拖选图片区域" style="display:none"></div>'),
				select = $('<span class="apm-area-select">' +
					'   <span class="apm-area-border"></span>' +
					'</span>'),
				area = $('<a class="apm-area-item"></a>'),
				parent = {
					left: container.offset().left,
					top: container.offset().top,
					width: container.width(),
					height: container.height()
				},
				selecting = false;

			// 创建遮挡层
			container.append(mask.fadeIn('fast', function () {
				$(this).show();
			}));

			// 鼠标按下准备框选
			container.on('mousedown.select', function (e) {

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
					transition: 'slide',
					title: ''
				});
				area.css({
					left: select.position().left,
					top: select.position().top,
					width: Math.max(select.width()),
					height: Math.max(select.height())
				});
				container.append(area);

				// 移除框选
				mask.fadeOut('fast', function () {
					$(this).remove();
				});
				select.remove();

				// 解除选区绑定
				container.unbind('mousedown.select');
				$(this).unbind('mousemove.select');
				$(this).unbind('mouseup.select');

			});

		},

		// 构建渲染热区节点
		__build: function (area) {

			var self = this,
				attr = self.__attr(area), form;

			// 创建编辑表单
			area.append(Mustache.render(TEMPLATE_AREA_ITEM, attr));
			form = area.find('.apm-area-form');

			// 拖动和缩放
			area.jqDrag('.apm-area-border').jqResize('.apm-area-resize');

			// 禁止热区默认事件
			area.on('click', function (e) {
				var type = e.target.type;
				if (type !== 'submit' && type !== 'file') {
					e.preventDefault();
				}
			});

			// 编辑热区
			area.on('click', '.apm-area-edit', function () {
				area.siblings().find('.apm-area-form').hide();
				form.fadeToggle('fast');
				self.__reset(area);
			});

			// 删除热区
			area.on('click', '.apm-area-remove', function () {
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
			area.on('click', '.apm-button-gray', function () {
				form.fadeOut('fast');
			});

			// 恢复字段全选功能，防止和拖拽功能冲突
			form.on('keyup', '.apm-form-text', function (e) {
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
				transition: area.attr('data-transition'),
				title: area.attr('title'),
				left: pos.left,
				top: pos.top,
				width: area.width(),
				height: area.height()
			};

		},

		// 重设热区编辑表单
		__reset: function (area) {

			var form = area.find('.apm-area-form'),
				attr = this.__attr(area),
				href = form.find('.apm-area-field-href'),
				transition = form.find('.apm-area-field-transition');

			// 以此设置表单数据
			href[0].selectedIndex = href.find('option[value=' + attr.href + ']').index();
			transition[0].selectedIndex = transition.find('option[value=' + attr.transition + ']').index();
			form.find('.apm-area-field-title').val(attr.title);

		},

		// 回写热区编辑表单数据
		__edit: function (area) {

			var form = area.find('.apm-area-form'),
				href = form.find('.apm-area-field-href').val(),
				transition = form.find('.apm-area-field-transition').val(),
				title = form.find('.apm-area-field-title').val();

			// 设置链接属性
			area.attr({
				'href': $.trim(href),
				'data-transition': $.trim(transition),
				'title': $.trim(title)
			});

		},

		// 简易图片上传功能
		__upload: function (file, callback) {

			var formdata = new FormData();

			//设置参数
			formdata.append('nick', '邦彦');
			formdata.append('session_id', new Date().getTime());
			formdata.append('photo', file);

			$.ajax({
				dataType: 'json',
				url: './apm/upload.php',
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

		// 填充部件图片
		__append: function (trigger, url) {

			var img = $('<img src="' + url + '" alt="">');

			trigger.remove('img');
			trigger.append(img.load(function () {

				var height = img.height(),
					head = $('.apm-area-head'),
					body = $('.apm-area-body'),
					foot = $('.apm-area-foot');

				// 重置页头或页尾高度
				trigger.height(height);

				// 如果是页头，调整上偏移
				if (trigger.hasClass('apm-area-head')) {
					body.css('top', height);
				}

				// 如果是页尾，调整下偏移
				if (trigger.hasClass('apm-area-foot')) {
					body.css('bottom', height);
				}

			}));

		},

		// 绑定热区操作
		__bind: function () {

			var self = this, doc = $(document);

			// 添加页头、页尾
			$('.head-add, .foot-add').on('change', function (e) {

				var trigger = $($(this).attr('data-area'));
				self.__upload(e.currentTarget.files[0], function (url) {
					self.__append(trigger, url);
				});

			});

			// 添加热区
			$('.area-add').on('click', function () {

				var container = $($(this).attr('data-area'));
				if (container.children('.apm-area-mask').length === 0) {
					self.__select(container);
				}

			});

			// 保存所有热区
			doc.on('click', '.area-save', function () {
				self.__setAreas();
			});

		},

		// 保存所有热区
		__setAreas: function () {

			var self = this,
				list = [];
			module.find('.apm-area-item').each(function (k, v) {
				list.push(self.__attr($(v)));
			});

			// 保存至后端的数据
			$.ajax({
				type: 'post',
				// todo
				url: '../tests/setAreas.php',
				data: {
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
		render: function (container) {

			var self = this,
				_container = container ? $(container) : $('.apm-area');

			// 遍历并渲染原始热区
			_container.find('.apm-area-item').each(function (k, v) {
				self.__build($(v));
			});

		},

		// 初始化
		init: function () {

			this.render();
			this.__bind();

		}

	};

	apm.init();

})(jQuery);