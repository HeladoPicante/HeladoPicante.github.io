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
        const images = await glob(`${inputFolder}/*.{jpg,jpeg,png,webp}`); // Asegura que sólo procesa imágenes
        
        const promises = images.map(async (file) => {
            try {
                // Verificar que el archivo existe y es accesible
                if (!fs.existsSync(file)) {
                    console.warn(`Archivo no encontrado: ${file}`);
                    return;
                }
                
                // Verificar que el archivo no esté vacío
                const stats = fs.statSync(file);
                if (stats.size === 0) {
                    console.warn(`Archivo vacío: ${file}`);
                    return;
                }
                
                // Verificar que es realmente una imagen válida
                try {
                    const metadata = await sharp(file).metadata();
                    if (!metadata.width || !metadata.height) {
                        console.warn(`Archivo no es una imagen válida: ${file}`);
                        return;
                    }
                } catch (metadataError) {
                    console.warn(`Error leyendo metadatos de ${file}: ${metadataError.message}`);
                    return;
                }
                
                const relativePath = path.relative('build/img/gallery', file); // Obtén el path relativo desde la raíz
                const subDir = path.dirname(relativePath).replace('full', 'thumb'); // Cambia `full` por `thumb`
                const outputDir = path.join(outputBaseFolder, subDir); // Carpeta donde se guardará la imagen

                // Asegúrate de que la carpeta `thumb` exista
                if (!fs.existsSync(outputDir)) {
                    fs.mkdirSync(outputDir, { recursive: true });
                }

                const fileName = path.basename(file); // Obtiene el nombre del archivo (ejemplo: imagen.jpg)
                const outputFile = path.join(outputDir, fileName); // Ruta completa del archivo procesado

                // Verificar si el archivo de salida ya existe y eliminarlo si es necesario
                const finalOutputFile = outputFile.replace(path.extname(outputFile), '.jpg');
                if (fs.existsSync(finalOutputFile)) {
                    try {
                        fs.unlinkSync(finalOutputFile);
                    } catch (unlinkError) {
                        // Si no podemos eliminar el archivo, probablemente esté en uso
                        // Intentar con un nombre temporal
                        console.warn(`No se pudo eliminar ${finalOutputFile}, usando nombre temporal`);
                    }
                }

                // Procesar la imagen con Sharp
                await sharp(file)
                    .resize(width, height, { 
                        position: 'centre',
                        fit: 'cover' // Asegurar que la imagen se ajuste correctamente
                    })
                    .jpeg({ quality: 80 }) // Convertir a JPEG para asegurar compatibilidad
                    .toFile(finalOutputFile);
                    
                console.log(`Procesada: ${finalOutputFile}`);
            } catch (err) {
                console.error(`Error al procesar ${file}:`, err.message);
            }
        });
        
        // Esperar a que todas las promesas se resuelvan
        await Promise.all(promises);
        done();
    } catch (error) {
        console.error('Error en el proceso de crop:', error);
        done(error);
    }
}
export async function imagenes(done) {
    const srcDir = './src/img';
    const buildDir = './build/img';
    
    try {
        const images = await glob('./src/img/**/*.{jpg,jpeg,png,webp}'); // Corregir el patrón glob
        
        const promises = images.map(async (file) => {
            try {
                // Verificar que el archivo existe
                if (!fs.existsSync(file)) {
                    console.warn(`Archivo no encontrado: ${file}`);
                    return;
                }
                
                // Verificar que el archivo no esté vacío
                const stats = fs.statSync(file);
                if (stats.size === 0) {
                    console.warn(`Archivo vacío: ${file}`);
                    return;
                }
                
                // Verificar que es realmente una imagen válida
                try {
                    const metadata = await sharp(file).metadata();
                    if (!metadata.width || !metadata.height) {
                        console.warn(`Archivo no es una imagen válida: ${file}`);
                        return;
                    }
                } catch (metadataError) {
                    console.warn(`Error leyendo metadatos de ${file}: ${metadataError.message}`);
                    return;
                }
                
                const relativePath = path.relative(srcDir, path.dirname(file));
                const outputSubDir = path.join(buildDir, relativePath);
                await procesarImagenes(file, outputSubDir);
            } catch (err) {
                console.error(`Error procesando imagen ${file}:`, err.message);
            }
        });
        
        // Esperar a que todas las promesas se resuelvan
        await Promise.all(promises);
        done();
    } catch (error) {
        console.error('Error en el proceso de imagenes:', error);
        done(error);
    }
}

async function procesarImagenes(file, outputSubDir) {
    try {
        if (!fs.existsSync(outputSubDir)) {
            fs.mkdirSync(outputSubDir, { recursive: true });
        }
        
        const baseName = path.basename(file, path.extname(file));
        const extName = path.extname(file);
        const outputFile = path.join(outputSubDir, `${baseName}${extName}`);
        const outputFileWebp = path.join(outputSubDir, `${baseName}.webp`);
        const outputFileAvif = path.join(outputSubDir, `${baseName}.avif`);

        const options = { quality: 80 };
        
        // Eliminar archivos existentes si existen para evitar conflictos
        [outputFile, outputFileWebp, outputFileAvif].forEach(targetFile => {
            if (fs.existsSync(targetFile)) {
                try {
                    fs.unlinkSync(targetFile);
                } catch (unlinkError) {
                    // Si no podemos eliminar el archivo, agregamos un timestamp para evitar conflictos
                    console.warn(`No se pudo eliminar ${targetFile}: ${unlinkError.message}`);
                }
            }
        });
        
        // Procesar las imágenes de forma secuencial para evitar problemas de concurrencia
        const sharpInstance = sharp(file);
        
        // Crear las diferentes versiones de la imagen secuencialmente para evitar conflictos
        try {
            await sharpInstance.clone().jpeg(options).toFile(outputFile);
            await sharpInstance.clone().webp(options).toFile(outputFileWebp);
            await sharpInstance.clone().avif().toFile(outputFileAvif);
        } catch (processError) {
            // Si hay un error, intentar crear solo la versión JPEG
            console.warn(`Error creando todas las versiones de ${file}, creando solo JPEG: ${processError.message}`);
            await sharpInstance.clone().jpeg(options).toFile(outputFile);
        }
        
        console.log(`Procesada: ${outputFile}`);
    } catch (error) {
        console.error(`Error procesando ${file}:`, error.message);
        throw error;
    }
}

export function dev() {
    watch('src/scss/**/*.scss', css);
    watch('src/js/**/*.js', js);
    watch('src/img/**/*.{png,jpg,jpeg,webp}', imagenes); // Corregir espacios en el patrón
}

export default series( crop, js, css, imagenes, dev )
// export default series( js, css, imagenes, dev )