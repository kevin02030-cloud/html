document.addEventListener('DOMContentLoaded', async () => {
    const pdfUrl = '지명원 (1).pdf';
    const bookContainer = document.getElementById('book');
    const loadingOverlay = document.getElementById('loading-overlay');
    
    // UI Controls
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const pageCurrent = document.getElementById('page-current');
    const pageTotal = document.getElementById('page-total');

    let pdfDoc = null;
    let pageFlip = null;
    
    // Book dimensions
    const bookWidth = 500;
    const bookHeight = 707; // A4 ratio

    try {
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        pdfDoc = await loadingTask.promise;
        pageTotal.textContent = pdfDoc.numPages;

        for (let i = 1; i <= pdfDoc.numPages; i++) {
            const page = await pdfDoc.getPage(i);
            const viewport = page.getViewport({ scale: 2.0 });

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context, viewport: viewport }).promise;

            const pageDiv = document.createElement('div');
            pageDiv.className = 'page';
            if (i === 1 || i === pdfDoc.numPages) pageDiv.classList.add('--page-hard');

            const pageContent = document.createElement('div');
            pageContent.className = 'page-content';
            pageContent.appendChild(canvas);
            
            pageDiv.appendChild(pageContent);
            bookContainer.appendChild(pageDiv);
        }

        pageFlip = new St.PageFlip(bookContainer, {
            width: bookWidth,
            height: bookHeight,
            size: "stretch",
            minWidth: 300,
            maxWidth: 600,
            minHeight: 424,
            maxHeight: 848,
            maxShadowOpacity: 0.5,
            showCover: true,
            mobileScrollSupport: false
        });

        pageFlip.loadFromHTML(document.querySelectorAll('.page'));
        loadingOverlay.style.display = 'none';

        pageFlip.on('flip', (e) => {
            pageCurrent.textContent = e.data + 1;
            btnPrev.disabled = e.data === 0;
            btnNext.disabled = e.data === pageFlip.getPageCount() - 1;
        });

        btnPrev.addEventListener('click', () => pageFlip.flipPrev());
        btnNext.addEventListener('click', () => pageFlip.flipNext());
        
        btnNext.disabled = pdfDoc.numPages <= 1;
        pageCurrent.textContent = 1;

    } catch (error) {
        console.error("Flipbook Error: ", error);
        loadingOverlay.innerHTML = `<p style="color:red;">Error: ${error.message}</p>`;
    }
});
