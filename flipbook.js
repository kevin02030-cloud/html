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
    
    // Book dimensions (A4 ratio approx)
    const bookWidth = 400;
    const bookHeight = 565;

    try {
        // 1. Load the PDF
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        pdfDoc = await loadingTask.promise;
        
        const numPages = pdfDoc.numPages;
        pageTotal.textContent = numPages;

        // 2. Render all pages to canvas and create HTML elements
        const pageElements = [];
        
        for (let i = 1; i <= numPages; i++) {
            const page = await pdfDoc.getPage(i);
            const viewport = page.getViewport({ scale: 1.5 }); // Higher scale for better resolution

            // Create Canvas
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            // Render PDF page into canvas context
            const renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            await page.render(renderContext).promise;

            // Create page wrapper for PageFlip
            const pageDiv = document.createElement('div');
            pageDiv.className = 'page';
            
            // Add hard cover class to first and last page
            if (i === 1 || i === numPages) {
                pageDiv.classList.add('--page-hard');
            }

            const pageContent = document.createElement('div');
            pageContent.className = 'page-content';
            pageContent.appendChild(canvas);
            
            pageDiv.appendChild(pageContent);
            bookContainer.appendChild(pageDiv);
            pageElements.push(pageDiv);
        }

        // 3. Initialize StPageFlip
        pageFlip = new St.PageFlip(bookContainer, {
            width: bookWidth, // base page width
            height: bookHeight, // base page height
            size: "stretch",
            minWidth: 300,
            maxWidth: 600,
            minHeight: 424,
            maxHeight: 848,
            maxShadowOpacity: 0.5,
            showCover: true,
            mobileScrollSupport: false
        });

        // Load the HTML elements into the flipbook
        pageFlip.loadFromHTML(document.querySelectorAll('.page'));

        // Hide loading overlay
        loadingOverlay.style.display = 'none';

        // 4. Setup Event Listeners for Controls
        pageFlip.on('flip', (e) => {
            pageCurrent.textContent = e.data + 1;
            
            // Enable/disable buttons based on current page
            btnPrev.disabled = e.data === 0;
            btnNext.disabled = e.data === pageFlip.getPageCount() - 1;
        });

        pageFlip.on('changeState', (e) => {
            if (e.data === 'read') {
                pageCurrent.textContent = pageFlip.getCurrentPageIndex() + 1;
            }
        });

        // Initial button states
        btnPrev.disabled = true;
        btnNext.disabled = numPages <= 1;
        pageCurrent.textContent = 1;

        btnPrev.addEventListener('click', () => {
            pageFlip.flipPrev();
        });

        btnNext.addEventListener('click', () => {
            pageFlip.flipNext();
        });

    } catch (error) {
        console.error("Error loading PDF or initializing flipbook: ", error);
        loadingOverlay.innerHTML = `<p style="color:red; font-weight:bold;">PDF 로딩 중 오류가 발생했습니다.<br>${error.message}</p>`;
    }
});
