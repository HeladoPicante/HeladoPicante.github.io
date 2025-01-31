import path from 'path'
import fs from 'fs'

import { glob } from 'glob'
import { src, dest, watch, series } from 'gulp'
import * as dartSass from 'sass'
import gulpSass from 'gulp-sass'
import terser from 'gulp-terser'
import sharp from 'sharp'

const sass = gulpSass(dartSass)
// const sass = import('sass')

export function js( done ) {
    src('src/js/app.js')
        // .pipe( terser() )
        .pipe( dest('build/js') ) 

    done()
}

export function css( done ) {
    src('src/scss/app.scss', {sourcemaps: true})
        .pipe( sass(
            // {outputStyle: 'compressed'}
        ).on('error', sass.logError) )
        .pipe( dest('build/css', {sourcemaps: '.'}) )

    done()
}

//minificar imagenes
export async function crop(done) {
    const inputFolder = 'build/img/gallery/**/full'; // Carpeta donde están las imágenes originales
    const outputBaseFolder = 'build/img/gallery';   // Base donde estarán las imágenes miniaturizadas
    const width = 250;
    const height = 180;

    try {
        // Usamos glob para obtener todas las imágenes en las subcarpetas `full`
        const images = await glob(`${inputFolder}/*.{jpg,png}`); // Asegura que sólo procesa imágenes

        images.forEach(file => {
            const relativePath = path.relative('build/img/gallery', file); // Obtén el path relativo desde la raíz
            const subDir = path.dirname(relativePath).replace('full', 'thumb'); // Cambia `full` por `thumb`
            const outputDir = path.join(outputBaseFolder, subDir); // Carpeta donde se guardará la imagen

            // Asegúrate de que la carpeta `thumb` exista
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            const fileName = path.basename(file); // Obtiene el nombre del archivo (ejemplo: imagen.jpg)
            const outputFile = path.join(outputDir, fileName); // Ruta completa del archivo procesado

            // Procesar la imagen con Sharp
            sharp(file)
                .resize(width, height, { position: 'centre' }) // Resize con ajuste centrado
                .toFile(outputFile)
                .then(() => {
                    console.log(`Procesada: ${outputFile}`);
                })
                .catch(err => console.error(`Error al procesar ${file}:`, err));
        });

        done();
    } catch (error) {
        console.error('Error en el proceso de crop:', error);
        done(error);
    }
}
export async function imagenes(done) {
    const srcDir = './src/img';
    const buildDir = './build/img';
    const images =  await glob('./src/img/**/*{jpg,png}')

    images.forEach(file => {
        const relativePath = path.relative(srcDir, path.dirname(file));
        const outputSubDir = path.join(buildDir, relativePath);
        procesarImagenes(file, outputSubDir);
    });
    done();
}

function procesarImagenes(file, outputSubDir) {
    if (!fs.existsSync(outputSubDir)) {
        fs.mkdirSync(outputSubDir, { recursive: true })
    }
    const baseName = path.basename(file, path.extname(file))
    const extName = path.extname(file)
    const outputFile = path.join(outputSubDir, `${baseName}${extName}`)
    const outputFileWebp = path.join(outputSubDir, `${baseName}.webp`)
    const outputFileAvif = path.join(outputSubDir, `${baseName}.avif`)

    const options = { quality: 80 }
    sharp(file).jpeg(options).toFile(outputFile)
    sharp(file).webp(options).toFile(outputFileWebp)
    sharp(file).avif().toFile(outputFileAvif)
}

export function dev() {
    watch('src/scss/**/*.scss', css)
    watch('src/js/**/*.js', js)
    watch('src/img/**/*.{png, jpg}', imagenes)
}

export default series( crop, js, css, imagenes, dev )
// export default series( js, css, imagenes, dev )