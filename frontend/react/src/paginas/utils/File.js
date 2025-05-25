
export function TipoPorExtension(nombreArchivo) {
    const ext = nombreArchivo.split('.').pop().toLowerCase();
    const extensionesFotos = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff', 'heic'];
    const extensionesVideos = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'];
    const extensionesSonidos = ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'];
    const extensionesModelos3D = ['obj', 'fbx', 'glb', 'gltf', 'stl', 'dae', '3ds', '3mf'];
    const extensionesScripts = [
        'cs', 'cpp', 'h', 'py', 'js', 'ts', 'java', 'rb', 'php', 'html', 'css',
        'json', 'xml', 'sql', 'sh', 'bat', 'go', 'swift', 'kt', 'rs', 'pl', 'lua',
        'r', 'asm', 'vb', 'dart', 'scala', 'md', 'yml', 'yaml', 'ini', 'cfg', 'pdf', 'txt'
    ];

    if (extensionesFotos.includes(ext)) return 'imagen';
    if (extensionesVideos.includes(ext)) return 'vídeo';
    if (extensionesSonidos.includes(ext)) return 'sonido';
    if (extensionesModelos3D.includes(ext)) return 'modelo';
    if (extensionesScripts.includes(ext)) return 'script';

    return 'desconocido';
}

export async function ObtenerTipoArchivo(file) {
    const leerBytes = (file, length = 64) =>
        new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(new Uint8Array(e.target.result));
            reader.onerror = () => resolve(null);
            reader.readAsArrayBuffer(file.slice(0, length));
        });

    const bytes = await leerBytes(file);
    if (!bytes) return { tipo: TipoPorExtension(file.name), file: file };

    const comparar = (inicio, firma) => {
        if (firma.length > inicio.length) return false;
        for (let i = 0; i < firma.length; i++) {
            if (inicio[i] !== firma[i]) return false;
        }
        return true;
    };

    function detectarExtensionReal(bytes) {
        console.log(JSON.stringify(bytes));

        // IMÁGENES
        if (comparar(bytes, [0xFF, 0xD8, 0xFF])) return 'jpg';        // jpg/jpeg
        if (comparar(bytes, [0x89, 0x50, 0x4E, 0x47])) return 'png';
        if (comparar(bytes, [0x47, 0x49, 0x46, 0x38])) return 'gif';
        if (comparar(bytes, [0x42, 0x4D])) return 'bmp';
        if (comparar(bytes, [0x49, 0x49, 0x2A, 0x00]) ||
            comparar(bytes, [0x4D, 0x4D, 0x00, 0x2A]))
            return 'tiff';

        if (bytes.length > 12) {
            const ftyp = String.fromCharCode(...bytes.slice(4, 8));
            if (ftyp === 'ftyp') {
                const brand = String.fromCharCode(...bytes.slice(8, 12));
                if (['heic', 'heix', 'hevc', 'hevx'].includes(brand)) return 'heic';
            }
        }

        // WEBP
        if (comparar(bytes.slice(0, 4), [0x52, 0x49, 0x46, 0x46]) &&
            comparar(bytes.slice(8, 12), [0x57, 0x45, 0x42, 0x50]))
            return 'webp';

        // VIDEO
        if (bytes.length > 12 &&
            comparar(bytes.slice(4, 8), [0x66, 0x74, 0x79, 0x70])) {
            // MP4 y derivados
            const brand = String.fromCharCode(...bytes.slice(8, 12));
            if (
                [
                    'mp41',
                    'mp42',
                    'isom',
                    'iso2',
                    'avc1',
                    'hvc1',
                    'hev1',
                    'qt  ',
                    'M4V ',
                ].includes(brand)
            )
                return 'mp4';
        }

        if (comparar(bytes, [0x52, 0x49, 0x46, 0x46]) &&
            String.fromCharCode(...bytes.slice(8, 12)) === 'AVI ')
            return 'avi';

        if (comparar(bytes, [0x00, 0x00, 0x00, 0x14, 0x66, 0x74, 0x79, 0x70])) return 'mov';
        if (comparar(bytes, [0x30, 0x26, 0xB2, 0x75, 0x8E, 0x66, 0xCF, 0x11])) return 'wmv';
        if (comparar(bytes, [0x46, 0x4C, 0x56])) return 'flv';
        if (comparar(bytes, [0x1A, 0x45, 0xDF, 0xA3])) return 'mkv';
        if (comparar(bytes, [0x1F, 0x8B]) && // gzip compressed file (podría ser webm)
            bytes.length > 40 &&
            comparar(bytes.slice(31, 35), [0x6D, 0x61, 0x74, 0x72]))
            return 'webm';

        // AUDIO
        if (comparar(bytes, [0x49, 0x44, 0x33]) || // ID3 tag mp3
            (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0))
            return 'mp3';

        if (comparar(bytes, [0x52, 0x49, 0x46, 0x46]) &&
            String.fromCharCode(...bytes.slice(8, 12)) === 'WAVE')
            return 'wav';

        if (comparar(bytes, [0x4F, 0x67, 0x67, 0x53])) return 'ogg';
        if (comparar(bytes, [0x66, 0x4C, 0x61, 0x43])) return 'flac';
        if (comparar(bytes.slice(0, 2), [0xFF, 0xF1]) || comparar(bytes.slice(0, 2), [0xFF, 0xF9]))
            return 'aac';

        // 3D MODELOS (algunos no tienen firmas claras, pero algunos sí)
        const textoInicio = new TextDecoder('utf-8').decode(bytes.slice(0, 20)).toLowerCase();
        if (textoInicio.startsWith('solid')) return 'stl';
        if (comparar(bytes, [0x67, 0x6C, 0x54, 0x46])) // glb binary header
            return 'glb';

        // FBX binario
        if (bytes.length > 21 && comparar(bytes.slice(0, 21), [
                0x46, 0x42, 0x58, 0x20, 0x37, 0x30, 0x30, 0x30, 0x00, 0x1A, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            ])
        )
            return 'fbx';

        // OBJ, DAE, 3DS, 3MF no tienen magic numbers binarios claros (texto o zip)
        if (textoInicio.startsWith('o ') || textoInicio.startsWith('v ')) return 'obj'; // obj muy básico

        // ZIP files (usado por gltf, 3mf, dae puede ser zip)
        if (comparar(bytes, [0x50, 0x4B, 0x03, 0x04])) {
            // Puede ser zip, gltf, 3mf, dae
            // Podrías mejorar con lectura de contenido zip, pero escapa acá.
            return 'zip';
        }

        return null;
    } 

    const extReal = detectarExtensionReal(bytes);
    const extOriginal = file.name.split('.').pop().toLowerCase();

    if (extReal && extReal !== extOriginal) {
        const nombreSinExt = file.name.slice(0, file.name.lastIndexOf('.'));
        const nuevoNombre = nombreSinExt + '.' + extReal;
        const fileCorregido = new File([file], nuevoNombre, {
            type: file.type,
            size: file.size,
            lastModified: file.lastModified,
        });
        return { tipo: TipoPorExtension(nuevoNombre), file: fileCorregido };
    }

    return { tipo: TipoPorExtension(file.name), file: file };
}
