class PageReplacer {
    constructor(frames) {
        this.frames = frames;
        this.pageFaults = 0;
        this.hits = 0;
    }
}

function simulate() {
    // Get user inputs
    const frameCount = parseInt(document.getElementById('frames').value);
    const refString = document.getElementById('refString').value.split(' ').map(Number);
    const algorithm = document.getElementById('algorithm').value;

    // Validate inputs
    if (isNaN(frameCount) || refString.some(isNaN)) {
        alert('Please enter valid numbers');
        return;
    }

    // Run selected algorithm
    let result;
    switch(algorithm) {
        case 'FIFO':
            result = fifo(frameCount, refString);
            break;
        case 'LRU':
            result = lru(frameCount, refString);
            break;
        case 'OPTIMAL':
            result = optimal(frameCount, refString);
            break;
    }

    // Display results
    displaySimulationSteps(result.steps);
    displayMetrics(result.pageFaults, result.hits);
}

function fifo(frameCount, refString) {
    let frames = [];
    let queue = [];
    let steps = [];
    let pageFaults = 0;

    for (let page of refString) {
        if (frames.includes(page)) {
            steps.push({frames: [...frames], fault: false});
            continue;
        }

        if (frames.length < frameCount) {
            frames.push(page);
            queue.push(page);
        } else {
            const removed = queue.shift();
            frames[frames.indexOf(removed)] = page;
            queue.push(page);
        }
        pageFaults++;
        steps.push({frames: [...frames], fault: true});
    }

    return { steps, pageFaults, hits: refString.length - pageFaults };
}

function lru(frameCount, refString) {
    let frames = [];
    let used = new Map();
    let steps = [];
    let pageFaults = 0;

    refString.forEach((page, index) => {
        if (frames.includes(page)) {
            used.set(page, index);
            steps.push({frames: [...frames], fault: false});
            return;
        }

        if (frames.length < frameCount) {
            frames.push(page);
        } else {
            let lruPage = Array.from(used.entries()).reduce((a, b) => a[1] < b[1] ? a : b)[0];
            frames[frames.indexOf(lruPage)] = page;
        }
        used.set(page, index);
        pageFaults++;
        steps.push({frames: [...frames], fault: true});
    });

    return { steps, pageFaults, hits: refString.length - pageFaults };
}

function optimal(frameCount, refString) {
    let frames = [];
    let steps = [];
    let pageFaults = 0;

    refString.forEach((page, index) => {
        if (frames.includes(page)) {
            steps.push({frames: [...frames], fault: false});
            return;
        }

        if (frames.length < frameCount) {
            frames.push(page);
        } else {
            let futureRefs = refString.slice(index + 1);
            let farthest = -1;
            let replacePage = frames[0];
            
            for (let frame of frames) {
                let nextUse = futureRefs.indexOf(frame);
                if (nextUse === -1) {
                    replacePage = frame;
                    break;
                }
                if (nextUse > farthest) {
                    farthest = nextUse;
                    replacePage = frame;
                }
            }
            frames[frames.indexOf(replacePage)] = page;
        }
        pageFaults++;
        steps.push({frames: [...frames], fault: true});
    });

    return { steps, pageFaults, hits: refString.length - pageFaults };
}

function displaySimulationSteps(steps) {
    const container = document.getElementById('stepsContainer');
    container.innerHTML = '';

    steps.forEach((step, index) => {
        const stepDiv = document.createElement('div');
        stepDiv.className = 'step';
        
        const stepHeader = document.createElement('div');
        stepHeader.textContent = `Step ${index + 1}:`;
        stepDiv.appendChild(stepHeader);

        const frameRow = document.createElement('div');
        frameRow.className = 'frame-row';
        
        step.frames.forEach(frame => {
            const frameElement = document.createElement('div');
            frameElement.className = `frame ${step.fault ? 'page-fault' : ''}`;
            frameElement.textContent = frame;
            frameRow.appendChild(frameElement);
        });

        stepDiv.appendChild(frameRow);
        container.appendChild(stepDiv);
    });
}

function displayMetrics(pageFaults, hits) {
    const metricsDiv = document.getElementById('metrics');
    const hitRatio = (hits / (pageFaults + hits) * 100).toFixed(2);
    
    metricsDiv.innerHTML = `
        <div class="metric-item">Total Page Faults: ${pageFaults}</div>
        <div class="metric-item">Total Hits: ${hits}</div>
        <div class="metric-item">Hit Ratio: ${hitRatio}%</div>
    `;
}