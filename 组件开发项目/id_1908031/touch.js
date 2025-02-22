/**
 * 手势支持
 *
 * @param main - 容器
 */
function enableGesture(main) {
	let start = (point, context) => {
		// 开始位置
		context.startX = point.clientX;
		context.startY = point.clientY;
		// 开始时间戳
		context.startTime = Date.now();
		// 点击
		context.isTap = true;
		// 拖动
		context.isPan = false;
		// 长按
		context.isPress = false;
		context.pressHandler = setTimeout(() => {
			context.isPress = true;
			context.isTap = false;
			let e = new Event("pressstart");
			main.dispatchEvent(e);
			context.pressHandler = null;
		}, 500)
	};

	// 移动
	let move = (point, context) => {
		// 计算移动的位置
		let dx = point.clientX - context.startX, dy = point.clientY - context.startY;
		// 判断手势类型
		if (dx * dx + dy * dy > 100) {

			if (context.pressHandler !== null) {
				clearTimeout(context.pressHandler);
				context.pressHandler = null;
				context.isPress = false;
			} else if (context.isPress) {
				context.isPress = false;
				let e = new Event("presscancel");
				main.dispatchEvent(e);
			}

			context.isTap = false;

			if (context.isPan === false) {
				if (Math.abs(dx) > Math.abs(dy)) {
					context.isVertical = false;
					context.isHorziontal = true;
				} else {
					context.isVertical = true;
					context.isHorziontal = false;
				}
				let e = new Event('panstart');
				e.startX = context.startX;
				e.startY = context.startY;
				main.dispatchEvent(e);
				context.isPan = true;
			}
		}

		if (context.isPan) {
			let e = new Event('pan');
			e.dx = dx;
			e.dy = dy;
			e.isVertical = context.isVertical;
			e.isHorziontal = context.isHorziontal;
			main.dispatchEvent(e);
		}
	};
	// 结束
	let end = (point, context) => {
		let dx = point.clientX - context.startX, dy = point.clientY - context.startY;
		if (context.pressHandler !== null) {
			clearTimeout(context.pressHandler);
		}
		if (context.isPress) {
			// 创建事件监听
			let e = new Event("pressend");
			main.dispatchEvent(e);
		}
		if (context.isTap) {
			let e = new Event('tap');
			main.dispatchEvent(e);
		}
		let v = Math.sqrt(dx * dx + dy * dy / (Date.now() - context.startTime));

		if (context.isPan && v > 0.3) {
			context.isFlick = true;
			let e = new Event("flick");
			e.dx = dx;
			e.dy = dy;
			main.dispatchEvent(e);
		} else {
			context.isFlick = false;
		}
		if (context.isPan) {
			let e = new Event(`panend`);
			e.dx = dx;
			e.dy = dy;
			e.isFlick = context.isFlick;
			e.isVertical = context.isVertical;
			e.isHorziontal = context.isHorziontal;
			main.dispatchEvent(e);
		}
	};
	// 取消事件
	let cancel = (point, context) => {
		if(context.isPan) {
			let e = new Event("pancancel");
			main.dispatchEvent(e);
		}
		if(context.isPress) {
			let e = new Event("presscancel");
			main.dispatchEvent(e);
		}
		if(context.pressHandler !== null) {
			let e = new Event("pancancel");
			main.dispatchEvent(e);
			clearTimeout(context.pressHandler);
		}
	};

	let contexts = Object.create(null);

	let mouseSymbol = Symbol('mouse');
	// 鼠标按下事件
	let mousedown = e => {
		// 监听移动，抬起
		document.addEventListener('mousemove', mousemove);
		document.addEventListener('mouseup', mouseup);
		contexts[mouseSymbol] = Object.create(null);
		start(e, contexts[mouseSymbol]);
	};

	let mousemove = event => {
		move(event, contexts[mouseSymbol]);
	};

	let mouseup = e => {
		document.removeEventListener('mousemove', mousemove);
		document.removeEventListener('mouseup', mouseup);
		end(e, contexts[mouseSymbol]);
		delete contexts[mouseSymbol]
	};

	main.addEventListener('mousedown', mousedown);

	let touchstart = event => {
		for (let touch of event.changedTouches) {
			contexts[touch.identifier] = Object.create(null);
			start(touch, contexts[touch.identifier]);
		}

	};
	let touchmove = event => {
		for (let touch of event.changedTouches)
			move(touch, contexts[touch.identifier]);
	};
	let touchend = event => {
		for (let touch of event.changedTouches) {
			end(touch, contexts[touch.identifier]);
			delete contexts[touch.identifier];
		}

	};
	let touchcancel = event => {
		for (let touch of event.changedTouches) {
			cancel(touch, contexts[touch.identifier]);
			delete contexts[touch.identifier];
		}
	};
	// 容器监听手势事件
	main.addEventListener('touchstart', touchstart);
	main.addEventListener('touchmove', touchmove);
	main.addEventListener('touchend', touchend);
	main.addEventListener('touchcancel', touchcancel);
}
