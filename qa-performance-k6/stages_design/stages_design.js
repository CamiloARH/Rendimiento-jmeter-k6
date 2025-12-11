import fs from "fs"
import puppeteer from 'puppeteer';
import path from 'path';
import * as stages from '../stages.js';

// Título de la gráfica
graficarStages('Pruebas de carga')

export function graficarStages(titulo){
    const [x, y] = convertirStages();
    generarHTML(x,y,titulo);
}

function convertirStages(){
    const x = [];
    const y = [];
    
    for (const stage in stages){
        if (Array.isArray(stages[stage])){
            const x_aux = [0];
            const y_aux = [0];
            stages[stage].forEach(line => {
                x_aux.push(parseInt((line.duration).replace('s', '')));
                y_aux.push(line.target);
            })
            x.push(actualizarTiempos(x_aux));
            y.push(y_aux);
        }
    }

    return [x,y];
}

function actualizarTiempos(x){
    const x_new = [];
    let count = 0;
    x.forEach(n => {
        count+=n;
        x_new.push(count);
    })

    return x_new;
}

function generarHTML(x_in,y_in,titulo){

    for(let i = 0; i<x_in.length; i++){

        // Tamaño del gráfico
        const width = 1000;
        const height = 600;

        const nombreArchivo = './stages_design/stage_'+i+'.html';
        const trace = {
            x: x_in[i],
            y: y_in[i],
            type: 'scatter',
            mode: 'lines+markers',
            line: { color: 'rgb(122, 3, 190)', width: 2 }, 
            name: 'My Data'
        };

        const areaBajoLaCurva = trapz(trace.x, trace.y)
        
        // Nombre de los ejes de la gráfica
        const layout = {
            title: titulo,
            xaxis: { title: 'Segundos' },
            yaxis: { title: 'Peticiones por segundo' }
        };

        const htmlContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
        </head>
        <body style="display: flex; flex-direction: column; align-items: center; justify-content: center; margin: 0; padding: 0; height: 100vh;">
            <div id="chart" style="width:${width}px;height:${height}px; display: flex; flex-direction: column; align-items: center;"></div>
            <script>
                const data = ${JSON.stringify([trace])};
                const layout = ${JSON.stringify(layout)};
                Plotly.newPlot('chart', data, layout);
            </script>
            <div style = "display: flex; flex-direction: column; align-items: center;">
                <table style="border-collapse: collapse; border: 1px solid black; width: 180%;">
                    <tbody>
                        <tr>
                            <td style="width: 50%; border: double rgb(0, 0, 0);">
                                <div style="text-align: center;">Peticiones totales</div>
                            </td>
                            <td style="width: 50%; border: double rgb(0, 0, 0);">
                                <div style="text-align: center;">${areaBajoLaCurva}</div>
                            </td>
                        </tr>
                        <tr>
                            <td style="width: 50%; border: double rgb(0, 0, 0);">
                                <div style="text-align: center;">Tiempo total (seg)</div>
                            </td>
                            <td style="width: 50%; border: double rgb(0, 0, 0);">
                                <div style="text-align: center;">${trace.x.at(-1)}</div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </body>
        </html>
        `;
        fs.writeFileSync(nombreArchivo, htmlContent, { encoding: "utf8" });
        generarImagen(nombreArchivo,i,width,height)
    }
}

async function generarImagen(ruta, n, width, height) {

    const __dirname = path.resolve();

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const filePath = path.resolve(__dirname, ruta);
    await page.goto(`file://${filePath}`);

    await page.setViewport({ width: Math.round(width*1.1), height: Math.round(height*1.15) });

    await page.screenshot({
        path: './stages_design/design_result_'+n+'.png', 
        fullPage: true, 
        type: 'png'
    });

    await browser.close();
    console.log(`*** Gráficas y HTML generados para stage ${n+1} ***`)

}

function trapz(x, y) {
    if (x.length !== y.length) {
        throw new Error("*** Arrays x and y must have same length ***");
    }

    let integral = 0;
    for (let i = 1; i < x.length; i++) {
        const dx = x[i] - x[i - 1];
        const avgHeight = (y[i] + y[i - 1]) / 2;
        integral += dx * avgHeight;
    }

    return integral;
}