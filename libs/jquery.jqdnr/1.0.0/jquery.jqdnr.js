/*
 * jqDnR-touch - Minimalistic Drag'n'Resize for jQuery.
 * Licensed under the MIT License: http://www.opensource.org/licenses/mit-license.php
 *
 * http://github.com/gaarf/jqDnR-touch
 */

(function ($) {

	var DOWN = 'mousedown touchstart',
		MOVE = 'mousemove touchmove',
		STOP = 'mouseup touchend',
		E, M = {};

	function xy(v) {
		var y = v.pageY,
			x = v.pageX,
			t = v.originalEvent.targetTouches;
		if(t) {
			x = t[0]['pageX'];
			y = t[0]['pageY'];
		}
		return {x:x,y:y};
	}

	function toTop($e) {
		var z = 1;
		$e.siblings().each(function(){
			z = Math.max(parseInt($(this).css("z-index"),10) || 1,z);
		});
		return $e.css('z-index', z+1);
	}

	function init(e,h,k) {
		return e.each( function() {
			var $box = $(this),
				$handle = (h) ? $(h,this).css('cursor',k) : $box;
			$handle.bind(DOWN, {e:$box,k:k}, onGripStart);
			if(k=='move') {
				$box.bind(DOWN,{},function(){toTop($box).trigger('jqDnRtop')});
			}
		});
	}

	function onGripStart(v) {
		var p = xy(v), f = function(k) { return parseInt(E.css(k))||false; };
		E = toTop(v.data.e);
		M = {
			X:f('left')||0, Y:f('top')||0,
			W:f('width')||E[0].scrollWidth||0, H:f('height')||E[0].scrollHeight||0,
			pX:p.x, pY:p.y, k:v.data.k, o:E.css('opacity')
		};
		E.css({opacity:0.7}).trigger('jqDnRstart');
		$(document).bind(MOVE,onGripDrag).bind(STOP,onGripEnd);
		return false;
	}

	function onGripDrag(v) {
		var p = xy(v);
		var w = E.parent().width(),
			h = E.parent().height(),
			x = E.position().left,
			y = E.position().top;
		if(M.k == 'move') {
			if(!E.css('position').match(/absolute|fixed/)) {
				E.css({position:'relative'});
			}
			//E.css({ left:M.X+p.x-M.pX, top:M.Y+p.y-M.pY } );
			E.css({
				left: (M.X+v.pageX-M.pX)<0?0:(M.X+v.pageX-M.pX)<w-M.W?(M.X+v.pageX-M.pX):w-M.W,
				top: (M.Y+v.pageY-M.pY)<0?0:(M.Y+v.pageY-M.pY)<h-M.H?(M.Y+v.pageY-M.pY):h-M.H
			});
		}
		else { // resize
			//E.css({ width:Math.max(p.x-M.pX+M.W,0), height:Math.max(p.y-M.pY+M.H,0) });
			E.css({
				width: (M.X+v.pageX-M.pX)<w-M.W?Math.max(v.pageX-M.pX+M.W,25):w-x,
				height: (M.Y+v.pageY-M.pY)<h-M.H?Math.max(v.pageY-M.pY+M.H,25):h-y
			});
		}
		return false;
	}

	function onGripEnd() {
		$(document).unbind(MOVE,onGripDrag).unbind(STOP,onGripEnd);
		E.css({opacity:M.o}).trigger('jqDnRend');
	}

	$.fn.jqDrag = function(h) { return init(this, h, 'move'); };
	$.fn.jqResize = function(h) { return init(this, h, 'se-resize'); };

})(jQuery);