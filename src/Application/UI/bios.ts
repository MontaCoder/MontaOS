export const getResourceSpacing = (sourceName: string) => {
    let spaces = '';
    for (let i = 0; i < 24 - sourceName.length; i++) spaces += '\xa0';
    return spaces;
};

export const getCurrentDate = (date = new Date()) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    const monthFormatted = month < 10 ? `0${month}` : month;
    const dayFormatted = day < 10 ? `0${day}` : day;
    return `${monthFormatted}/${dayFormatted}/${year}`;
};

export const detectWebGLContext = () => {
    const canvas = document.createElement('canvas');
    const gl =
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl');

    return Boolean(gl && gl instanceof WebGLRenderingContext);
};
