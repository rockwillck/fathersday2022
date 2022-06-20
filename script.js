var canvas = document.getElementById(`canvas`);
var ctx = canvas.getContext('2d');
var rect = canvas.getBoundingClientRect();
canvas.width = 1024
canvas.height = 768

var konamiCode = ""

function normalize(x, y, factor) {
    let hypot = Math.sqrt(x**2 + y**2)
    return [x/hypot * factor, y/hypot * factor]
}

class Particle {
    constructor(x, y, color) {
        this.pos = {x:x, y:y}
        this.direction = Math.random() * Math.PI * 2
        this.radius = Math.random() * canvas.height*0.035
        this.color = color
    }

    draw() {
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2*Math.PI)
        ctx.closePath()
        ctx.fill()

        this.pos.x += Math.cos(this.direction)
        this.pos.y += Math.sin(this.direction)
        this.radius *= 0.9
    }
}

class Fountain {
    constructor(x, y, slopeX, slopeY) {
        this.pos = {x:x, y:y}
        this.slope = {x:slopeX, y:slopeY}
        this.water = []
    }
    
    draw() {
        let randOffset = (Math.random() < 0.5 ? -1 : 1)*Math.random()*canvas.width/15000
        this.water.push({x:this.pos.x, y:this.pos.y, slope:Object.assign({}, this.slope), offset:randOffset})

        this.water.forEach((waterDroplet, index) => {
            ctx.fillStyle = konamiCode.includes("START") ? "yellow" : "rgba(50, 50, 255, 0.6)"
            ctx.beginPath()
            ctx.arc(waterDroplet.x, waterDroplet.y, waterRadius, 0, 2*Math.PI)
            ctx.closePath()
            ctx.fill()
            waterDroplet.x += waterDroplet.slope.x*dt
            waterDroplet.y += waterDroplet.slope.y*dt
            waterDroplet.slope.y += gravity
            waterDroplet.slope.x += waterDroplet.offset
            if (waterDroplet.x <= -waterRadius || waterDroplet.y >= canvas.width + waterRadius) {
                this.water.splice(index, 1)
            }

            if (waterDroplet.y >= canvas.height*0.97 + waterRadius) {
                for (let i=0; i<25; i++) {
                    let whiteness = Math.random()*150 + 105
                    particles.push(new Particle(waterDroplet.x, waterDroplet.y, `rgb(${whiteness}, ${whiteness}, ${whiteness})`))
                }
                this.water.splice(index, 1)
            }

            ctx.lineWidth = canvas.width/500
            if (konamiCode.includes("START")) {
                ctx.strokeStyle = "gray"
                ctx.fillStyle = "rgb(250, 250, 150)"
                roundRect(this.pos.x - canvas.width*0.025, this.pos.y, canvas.width*0.05, canvas.height*0.125)
                ctx.moveTo(this.pos.x, this.pos.y)
                ctx.lineTo(this.pos.x, this.pos.y + canvas.height*0.05)
                ctx.stroke()
                ctx.fillStyle = "rgb(225, 225, 150)"
                ctx.beginPath()
                ctx.arc(this.pos.x - canvas.width*0.025, this.pos.y + canvas.height*0.125, canvas.width*0.025, 0, 2*Math.PI)
                ctx.closePath()
                ctx.fill()
                ctx.stroke()
                ctx.beginPath()
                ctx.arc(this.pos.x + canvas.width*0.025, this.pos.y + canvas.height*0.125, canvas.width*0.025, 0, 2*Math.PI)
                ctx.closePath()
                ctx.fill()
                ctx.stroke()
            } else {
                ctx.strokeStyle = "black"
                ctx.fillStyle = "gray"
                ctx.beginPath()
                ctx.arc(this.pos.x, this.pos.y, canvas.height*0.025, 0, 2*Math.PI)
                ctx.closePath()
                ctx.fill()
                ctx.stroke()
                ctx.beginPath()
                ctx.arc(this.pos.x, this.pos.y+canvas.height*0.065, canvas.height*0.04, 0, 2*Math.PI)
                ctx.closePath()
                ctx.fill()
                ctx.stroke()
                ctx.fillRect(this.pos.x - canvas.width*0.03, this.pos.y+canvas.height*0.095, canvas.width*0.06, canvas.height*0.025)
                ctx.strokeRect(this.pos.x - canvas.width*0.03, this.pos.y+canvas.height*0.095, canvas.width*0.06, canvas.height*0.025)
            }
        })
    }
}

mousePos = {
    x:0,
    y:0
}

window.addEventListener("keydown", function(event) {
    konamiCode += event.key
    if (konamiCode.includes("ArrowUpArrowUpArrowDownArrowDownArrowLeftArrowRightArrowLeftArrowRightba") && !konamiCode.includes("START")) {
        if (confirm("START?")) {
            shakeLength = 800
            shakeFactor = canvas.width/100
            startShake()
            konamiCode += "START"
            setInterval(() => {
                shakeFactor = canvas.width/250
                shakeLength = 250
            }, shakeLength)
            document.getElementById("fountainMessage").innerText = "It takes balls to raise a child. Thank you!"
        }
    } else if (konamiCode.replace("ArrowUpArrowUpArrowDownArrowDownArrowLeftArrowRightArrowLeftArrowRightba", "").includes("ArrowUpArrowUpArrowDownArrowDownArrowLeftArrowRightArrowLeftArrowRightba") && konamiCode.includes("START")) {
        if (confirm("EXIT?")) {
            shakeLength = 800
            shakeFactor = canvas.width/100
            startShake()
            konamiCode = ""
            setInterval(() => {
                shakeFactor = canvas.width/250
                shakeLength = 250
            }, shakeLength)
            document.getElementById("fountainMessage").innerText = "You're a fountain of generosity in a sea of hate. <3"
        }
    }
})

window.addEventListener("keyup", function(event) {
    
})

window.addEventListener("mousemove", function(event) {
    var rect = canvas.getBoundingClientRect();
    mouseX = ((event.clientX - rect.left)/(window.innerWidth - rect.left*2))*canvas.width
    mouseY = ((event.clientY - rect.top)/(window.innerHeight - rect.top*2))*canvas.height
    mousePos.x = mouseX
    mousePos.y = mouseY
});

window.addEventListener('touchstart', function(e) {
    const event = e.changedTouches[0]
    mouseX = ((event.clientX - rect.left)/(window.innerWidth - rect.left*2))*canvas.width
    mouseY = ((event.clientY - rect.top)/(window.innerHeight - rect.top*2))*canvas.height

    if (mouseMode == 0) {
        mouseMode = 1
        currentFountainCreation = [mouseX, mouseY]
    } else if (mouseMode == 1) {
        startShake()
        mouseMode = 0
        slope = normalize(mouseX - currentFountainCreation[0], mouseY - currentFountainCreation[1], normFactor)
        fountains.push(new Fountain(currentFountainCreation[0], currentFountainCreation[1], slope[0], slope[1]))
    }
})

window.addEventListener("click", function(event) {
    var rect = canvas.getBoundingClientRect();
    mouseX = ((event.clientX - rect.left)/(window.innerWidth - rect.left*2))*canvas.width
    mouseY = ((event.clientY - rect.top)/(window.innerHeight - rect.top*2))*canvas.height

    if (mouseMode == 0) {
        mouseMode = 1
        currentFountainCreation = [mouseX, mouseY]
    } else if (mouseMode == 1) {
        startShake()
        mouseMode = 0
        slope = normalize(mouseX - currentFountainCreation[0], mouseY - currentFountainCreation[1], normFactor)
        fountains.push(new Fountain(currentFountainCreation[0], currentFountainCreation[1], slope[0], slope[1]))
    }
});

var shaking = false
function startShake() {
    shaking = true
    setTimeout(() => {
        shaking = false
    }, shakeLength)
}

function roundRect(x, y, width, height) {
    ctx.beginPath()
    ctx.arc(x + width/2, y+width/2, width/2, 0, 2*Math.PI)
    ctx.arc(x + width/2, y+height - width/2, width/2, 0, 2*Math.PI)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    ctx.fillRect(x, y + width/2, width, height - width)
    ctx.beginPath()
    ctx.moveTo(x, y+width/2)
    ctx.lineTo(x, y+height-width/2)
    ctx.moveTo(x+width, y+width/2)
    ctx.lineTo(x+width, y+height-width/2)
    ctx.closePath()
    ctx.stroke()
}

let frame = 1
var particles = []
var fountains = []
const cursorUndulatingSpeed = 40
const waterRadius = canvas.width/100
const gravity = canvas.height/750
var mouseMode = 0
var currentFountainCreation = []
const normFactor = canvas.width/75
var shakeFactor = canvas.width/250
var shakeLength = 250
let lastUpdate
var dt
function animate() {
    requestAnimationFrame(animate)

    var now = Date.now();
    dt = (now - lastUpdate)/30;
    lastUpdate = now;

    ctx.fillStyle = "rgb(150, 150, 150)"
    ctx.beginPath()
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.closePath()

    ctx.save()
    if (shaking) {
        ctx.translate(Math.random() < 0.5 ? -Math.random()*shakeFactor : Math.random()*shakeFactor, Math.random() < 0.5 ? -Math.random()*shakeFactor : Math.random()*shakeFactor)
    }
    fountains.forEach((fountain) => {
        fountain.draw()
    })

    particles.forEach((particle, index) => {
        particle.draw()
        if (particle.radius < 0.1) {
            particles.splice(index, 1)
        }
    })

    if (mouseMode == 1) {
        ctx.strokeStyle = "black"
        ctx.lineWidth = canvas.width/100
        ctx.fillStyle = ctx.strokeStyle
        ctx.beginPath()
        ctx.moveTo(currentFountainCreation[0], currentFountainCreation[1])
        ctx.lineTo(currentFountainCreation[0] + normalize(mouseX - currentFountainCreation[0], mouseY - currentFountainCreation[1], normFactor*gravity*2)[0], currentFountainCreation[1] + normalize(mouseX - currentFountainCreation[0], mouseY - currentFountainCreation[1], normFactor*gravity*2)[1])
        ctx.closePath()
        ctx.stroke()
        ctx.arc(currentFountainCreation[0] + normalize(mouseX - currentFountainCreation[0], mouseY - currentFountainCreation[1], normFactor*gravity*2)[0], currentFountainCreation[1] + normalize(mouseX - currentFountainCreation[0], mouseY - currentFountainCreation[1], normFactor*gravity*2)[1], ctx.lineWidth/2, 0, 2*Math.PI)
        ctx.fill()

        ctx.fillStyle = "white"
        ctx.beginPath()
        ctx.arc(currentFountainCreation[0], currentFountainCreation[1], canvas.width/100, 0, 2*Math.PI)
        ctx.closePath()
        ctx.fill()
    }
    ctx.restore()

    ctx.strokeStyle = "white"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(mousePos.x, mousePos.y, canvas.width/850, 0, 2*Math.PI)
    ctx.closePath()
    ctx.fillStyle = "white"
    ctx.fill()
    ctx.beginPath()
    ctx.arc(mousePos.x, mousePos.y, canvas.width/850 + ((frame % cursorUndulatingSpeed < cursorUndulatingSpeed/2 ? frame % cursorUndulatingSpeed : (cursorUndulatingSpeed - frame%cursorUndulatingSpeed)))/cursorUndulatingSpeed * canvas.width/50, 0, 2*Math.PI)
    ctx.closePath()
    ctx.stroke()

    
    frame += 1
}

animate()
