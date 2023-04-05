document.addEventListener('DOMContentLoaded', async () => {
	for (let img of document.querySelectorAll('img[src$=".xbm"]')) {
		let data = await fetch(img.src).then(r => r.text()),
			width = parseInt(data.replace(/.*_width ([0-9]*)/is, '$1')),
			height = parseInt(data.replace(/.*_height ([0-9]*)/is, '$1')),
			canvas = document.createElement('canvas'),
			ctx = canvas.getContext('2d'),
			drawing = ctx.createImageData(width, height),
			bytes = new Function(`return [${data.replace(/.*\{(.*?)\}.*/is, '$1')}]`)().slice(0, width * height),
			offset = 0;
		
		for (let byte of bytes) {
			let bits = (0xFF - byte).toString(2).padStart(8, '0');

			for (let b = 7; b >= 0; b--) {
				if ((offset / 4) % width == 0 && 7 - b == width % 8) break;

				for (let c = 0; c < 3; c++)
					drawing.data[offset + c] = parseInt(bits[b]) * 255;

				drawing.data[offset + 3] = 255;

				offset += 4;
			}
		}

		canvas.width  = width;
		canvas.height = height;

		ctx.putImageData(drawing, 0, 0);

		img.src = canvas.toDataURL();
	}
});