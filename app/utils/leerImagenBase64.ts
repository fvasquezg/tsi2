// para mejor tener esto definido y no llamarlo en cada guardar con una imagen
export function leerImagenBase64(archivo: File) {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => reject(new Error('No se pudo leer la imagen'))
        reader.readAsDataURL(archivo)
    })
}