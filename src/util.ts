export function noop() {
  return null
}

export const updateFileLists = (file, fileLists) => {
  const i = fileLists.findIndex((_) => _.uid === file.uid)
  i > -1 ? (fileLists[i] = { ...file }) : fileLists.push(file)
  return fileLists
}

export const deleteFile = (uid, fileLists) => {
  return fileLists.filter((_) => _.uid !== uid)
}

export const deleteId = (uid, ids) => {
  return ids.filter((_) => _ !== uid)
}

export function getUid() {
  let count = 0

  function getkey() {
    return `hf-upload-${new Date().valueOf()}-${count++}`
  }

  return getkey
}

const uid = getUid()

export function getFileExt(fileName: string): string {
  if (!fileName.includes('.')) {
    return ''
  }
  const tempArr = fileName.split('.')
  return tempArr[tempArr.length - 1]
}

export function fileToObject(file: any) {
  const { name, size, type, percent, ...rest } = file

  return {
    uid: uid(),
    name: name,
    file_size: size,
    mime_type: type || 'application/octet-stream', // application/octet-stream 为通用的mime_type
    percent: percent || 0,
    originFile: file,
    extension: getFileExt(name).toLowerCase(),
    ...rest,
  }
}

const rotation = {
  1: 'rotate(0deg)',
  3: 'rotate(180deg)',
  6: 'rotate(90deg)',
  8: 'rotate(270deg)',
}

const getImgPreview = (file, callback) => {
  const reader: FileReader = new FileReader()
  reader.onloadend = () => {
    const blobUrl = window.URL.createObjectURL(file)
    if (reader.error) {
      console.error('read file error', reader.error)
      if (callback) {
        callback(blobUrl)
      }

      return
    }

    const readerResult: any = reader.result
    const scanner = new DataView(readerResult)
    let idx = 0
    let value = 1 // Non-rotated is the default
    let maxBytes = scanner.byteLength

    // 不是 JPEG 文件
    if (scanner.getUint16(idx, false) != 0xffd8) {
      maxBytes = 0
    }

    idx += 2
    while (idx < maxBytes - 2) {
      const uint16 = scanner.getUint16(idx)
      idx += 2
      switch (uint16) {
        case 0xffe1: {
          // Start of EXIF
          const exifLength = scanner.getUint16(idx)
          maxBytes = exifLength - idx
          idx += 2
          break
        }
        case 0x0112: {
          // Orientation tag
          // Read the value, its 6 bytes further out
          // See page 102 at the following URL
          // http://www.kodak.com/global/plugins/acrobat/en/service/digCam/exifStandard2.pdf
          value = scanner.getUint16(idx + 6, false)
          maxBytes = 0 // Stop scanning
          break
        }
        default:
          break
      }
    }

    const img = new Image()
    img.src = blobUrl
    img.onload = () => {
      const width = img.width
      const height = img.height
      const aspect = width / height
      callback(blobUrl, width, height, aspect, value)
    }
    img.onerror = () => {
      callback()
    }
  }
  reader.readAsArrayBuffer(file)
}

export const preproccessFile = (file) => {
  return new Promise((resolve) => {
    const unPreview =
      typeof document === 'undefined' ||
      typeof window === 'undefined' ||
      !FileReader ||
      !File ||
      !(file.originFile instanceof File) ||
      file.thumbUrl !== undefined ||
      file.mime_type.indexOf('image') === -1

    function preview(f) {
      f.thumbUrl = ''
      getImgPreview(
        f.originFile,
        (previewDataUrl, width, height, aspect, value = 1) => {
          f.thumbUrl = previewDataUrl
          f.width = width
          f.height = height
          f.aspect = aspect
          f.transform = rotation[value]
          resolve(f)
        }
      )
    }

    if (unPreview) {
      resolve(file)
    } else {
      preview(file)
    }
  })
}
