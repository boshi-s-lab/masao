/*
 * Show Key: キー入力を表示
 * extensionsでInput Playerより前に加えると、プレイログ中も表示されます。
 *
 * 使い方:
 *   CanvasMasao.Gameに以下のオプションを渡す
 *   {
 *     extensions: [CanvasMasao.ShowKey],
 *     ShowKey: {
 *       position: Integer
 *       changePosKey: Integer  
 *     }
 *   }
 *
 *   ただし、positionはキー入力の表示位置で、初期値は1。0 ... 非表示、1 ... 下、2 ... 左、3 ... 右。
 *   changePosKeyはpositionを変更するキーのコードで、省略すると変更できない。
 */

CanvasMasao.ShowKey = (function() {
	var ShowKey = function(mc, position, changePosKey) {
		this.mc = mc;
		this.position = position;
		this.changePosKey = changePosKey;
		this.f = this.mc.masaoJSSAppletEmulator.newFont("Dialog", 1, 24);
		//キー番号とキーコードの表
		this.keyTable = [
			{"symbol":"←", "keyCode":[37, 100], "base64":"R0lGODlhGAAYAPECAAAAAAAAAP///wAAACH5BAkKAAAAIf8LTkVUU0NBUEUyLjADAQAAACwAAAAAGAAYAAACO4SPqcvtD6MEIUwVhLDXZM1d39ZRGtmN4aRW7lst40nXKDLb9nq0MNxQlTwnHqs4NIGSHyPLmYxKp5MCADs="},
			{"symbol":"→", "keyCode":[39, 102], "base64":"R0lGODlhGAAYAPECAAAAAAAAAP///wAAACH5BAkKAAAALAAAAAAYABgAAAI5hI+py+0PozwhTBWEsJfq3XkaF2ZjaJggU7Vu+5GI+tX2Ot96vLy+KpMAS7zO0FhE4kpBlPMJRRUAADs="},
			{"symbol":"↑", "keyCode":[38, 104], "base64":"R0lGODlhGAAYAPECAAAAAAAAAP///wAAACH5BAkKAAAALAAAAAAYABgAAAI/hI+py+0PUwiRBSFoRRfnbXTeV4kj+YidmnoT9sINuwLsUtuyjirTkbNpIkEQb2gsgpQbZmlnPEaByKn1Oi0AADs="},
			{"symbol":"↓", "keyCode":[40, 98], "base64":"R0lGODlhGAAYAPECAAAAAAAAAP///wAAACH5BAkKAAAALAAAAAAYABgAAAJAhI+py+0PUwiRBSFolVjvc2UfEnpjOYJdaqDVpIqtycmuq4QiqtMklin1Hr0O0LfQAVevJXOjREJwKRjris0WAAA7"},
			{"symbol":" ", "keyCode":[32], "base64":"R0lGODlhGAAYAPECAAAAAAAAAP///wAAACH5BAkKAAAALAAAAAAYABgAAAIvhI+py+0Po5y02ouz3rz7DyZBII2iIJBPgKoGm47yPLcIjOb6bh84D+z5aETipwAAOw=="},
			{"symbol":"Z", "keyCode":[90]},
			{"symbol":"X", "keyCode":[88]}
		];
		this.keyTable.forEach(elm=>elm["f_press"] = false);
		this.key_len = this.keyTable.length;

	};
	ShowKey.prototype.init = function() {
		this.keyTable.filter(elm=>elm["base64"]).forEach( (elm, idx, self)=>{
			elm["img"] = this.mc.masaoJSSAppletEmulator.newImageOnLoad("data:image/gif;base64," + elm["base64"]);
		})

		//GameKeyを書き換え。
		var gk = this.mc.gk;
		const _keyPressed = gk.keyPressed, 
			  _keyReleased = gk.keyReleased;
		const _this = this; 
		gk.keyPressed = function(paramKeyEvent) {
			_keyPressed.call(gk, paramKeyEvent);

			_this.showKeyInput(paramKeyEvent, true);

		};
		gk.keyReleased = function(paramKeyEvent) {
			_keyReleased.call(gk, paramKeyEvent);

			_this.showKeyInput(paramKeyEvent, false);
		};
	};

	ShowKey.prototype.showKeyInput = function(paramKeyEvent, f_press) {

		var mc = this.mc,
			ml_mode = mc.mp.ml_mode;
		if (ml_mode === 400 || ml_mode === 410 || ml_mode === 110 ) { // 描画が更新されないので描画しない。
			return;
		}

		const key_code = paramKeyEvent.keyCode;

		// changePosKey
		if (f_press && this.changePosKey && key_code === this.changePosKey) {
			this.position = (this.position + 1) % 4;
		}

		const key = this.keyTable.find(elm=>elm["keyCode"].includes(key_code));
		if (key === undefined) {
			return;
		}
		key["f_press"] = f_press;
	}


	ShowKey.prototype.masaoEvent = function(g, image) {
		var mc = this.mc,
			ml_mode = mc.mp.ml_mode;

		if (ml_mode === 400) { // クリア時にキー入力をリセット。
			this.keyTable.forEach(elm=>{elm["f_press"] = false;});
		}
		if (ml_mode === 400 || ml_mode === 410 || ml_mode === 110 ) { // 描画が更新されないので描画しない。
			return;
		}

		// 描画。
		if (this.position <= 0 || 4 <= this.position) {
			return;
		}

		const pos = (idx) => {
			let xx, yy;
			switch (this.position) {
				case 1:
				xx = 502 + (idx - this.key_len) * 25;
				yy = 286;
				break;
				case 2:
				xx = 10;
				yy = 10 + idx * 25;
				break;
				case 3:
				xx = 478;
				yy = 10 + idx * 25;
				break;
			}
			return [xx, yy];
		}

		this.keyTable.forEach( (elm, idx)=>{
			const al = 100 - 80 * (1 - elm["f_press"]);
			if (elm["img"]) {
				this.mc.masaoJSSAppletEmulator.drawImageAlphaComposite(elm["img"], ...pos(idx), al);
			}
			else {
				const t_textBaseline = g._ctx.textBaseline;
    			g._ctx.textBaseline = "top";
				const t_textAlign = g._ctx.textAlign;
    			g._ctx.textAlign = "center";
    			g._ctx.lineWidth = 1.1;
				const al2 = 255 - 140 * (1 - elm["f_press"]);
				g.setFont(this.f);
    			const pos2 = pos(idx);
    			pos2[0] += 12;
				this.mc.masaoJSSAppletEmulator.setOffscreenColor(255,255,255, al2);
				g._ctx.fillText(elm["symbol"], ...pos2);
				this.mc.masaoJSSAppletEmulator.setOffscreenColor(0, 0, 0, al2);
				g._ctx.strokeText(elm["symbol"], ...pos2);
    			g._ctx.textBaseline = t_textBaseline;
    			g._ctx.textAlign = t_textAlign;

			}

		})

	};

	ShowKey.inject = function(mc, options) {
		var _ui = mc.userInit,
			_us = mc.userSub;
		var o = options.ShowKey || {};
		var position = parseInt(o.position) || 1;
		var changePosKey = parseInt(o.changePosKey) || 0;
		mc.userInit = function() {
			_ui.apply(mc);
			this.showKey = new CanvasMasao.ShowKey(this, position, changePosKey);
			this.showKey.init();
		};
		mc.userSub = function(g, image) {
			_us.call(mc, g, image);
			this.showKey.masaoEvent(g, image);
		};
	};
	return ShowKey;
})();
