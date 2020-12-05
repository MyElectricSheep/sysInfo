const path = require('path')
const osu =  require('node-os-utils')

const cpu = osu.cpu
const mem = osu.mem
const os = osu.os

let cpuOverload = 80;
let alertFrequency = 5;

// Returns days, hours, mins, secs based on seconds input
const secondsToDhms = (seconds) => {
    seconds = +seconds // A way to turn seconds into number type
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    return `${d}d, ${h}h, ${m}m, ${s}s`
}

// Check how much time has passed since last notification
const runNotify = (frequency) => {
    const lastNotify = localStorage.getItem('lastNotify')
    if (!lastNotify) return true 

    const notifyTime = new Date(parseInt(lastNotify, 10))
    const now = new Date()
    const diffTime = Math.abs(now - notifyTime)
    const minutesPassed = Math.ceil(diffTime / (1000 * 60))

    if (minutesPassed > frequency) return true

    return false
}

const notifyUser = (options) => {
    // https://www.electronjs.org/docs/tutorial/notifications
    new Notification(options.title, options)
}

setInterval(() => {
    // CPU usage
    const cpuUsage = document.getElementById('cpu-usage')
    const cpuProgress = document.getElementById('cpu-progress')
    cpu.usage().then(info => {
        cpuUsage.innerText = `${info}%`
        cpuProgress.style.width = `${info}%`

        if (info >= cpuOverload) { cpuProgress.style.backgroundColor = "red" }
        else { cpuProgress.style.backgroundColor = "#30c88b"}

    // Check overload
    if (info >= cpuOverload && runNotify(alertFrequency)) {
        notifyUser({
            title: 'CPU Overload',
            body: `CPU is over ${cpuOverload}%`,
            icon: path.join(__dirname, 'img/icon.png')
        })
        localStorage.setItem('lastNotify', +new Date())
    }
    })

    // CPU free
    const cpuFree = document.getElementById('cpu-free')
    cpu.free().then(info => cpuFree.innerText = `${info}%`)

    // Uptime
    const uptime = document.getElementById('sys-uptime').innerText = secondsToDhms(os.uptime())


}, 2000)

// Set model
document.getElementById('cpu-model').innerText = cpu.model();

// Computer name
document.getElementById('comp-name').innerText = os.hostname();

// OS
document.getElementById('os').innerText = `${os.type()} ${os.arch()}`;

// Total mem
(async () => {
    const memInfo = await mem.info()
    document.getElementById('mem-total').innerText = `${memInfo.totalMemMb} Mb`
})()


