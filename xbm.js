document.addEventListener('DOMContentLoaded', async function() {
    for (let img of document.querySelectorAll('img[src$=".xbm"]')) {
        let data = await new Promise(resolve => {
            let request = new XMLHttpRequest();
            request.open('GET', img.src);
            request.responseType = 'text';
            request.send();
            request.onload = function() { resolve(this.response) };
        });
        
        let width  = parseInt(data.replace(/.*_width ([0-9]*).*/is, '$1')),
            height = parseInt(data.replace(/.*_height ([0-9]*).*/is, '$1')),
            
            array  = new Function('return [' + data.replace(/.*\{(.*?)\}.*/is, '$1') + ']')(),
            
            canvas = document.createElement('canvas'),
            ctx = canvas.getContext('2d', { alpha: false }),
            
            drawing = ctx.createImageData(width, height),
            offset  = 0;
        
        if (array.length > width * height)
            array = array.slice(0, width * height);
        
        for (let byte of array) {
            let bits = (byte >> 0)
                .toString(2)
                .padStart(8, '0')
                .split('')
                .map(b => parseInt(b))
                .reverse();
            
            for (let b = 0; b < bits.length; b++) {
                if (width % 8 != 0 && (offset / 4) % width == 0 && b == width % 8)
                    break;
                
                for (let c = 0; c < 3; c++)
                    drawing.data[offset + c] = ((bits[b] + 1) % 2) * 255;
                
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