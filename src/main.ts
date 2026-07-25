import './style.css'
import { type Event, EventStatus } from './models';

const appContainer = document.getElementById('app');

const eventsList: Event[] = [
    {
        id: '1',
        title: 'Latam Tour 2026',
        artist: 'Elena Pinderhughes',
        date: new Date('10-10-2026'),
        time: '20:00',
        status: EventStatus.SCHEDULED,
    },
    {
        id: '2',
        title: 'Latam Tour 2026',
        artist: 'Braxton Cook',
        date: new Date('10-11-2026'),
        time: '19:00',
        status: EventStatus.SCHEDULED,
    },
    {
        id: '3',
        title: 'Latam Tour 2026',
        artist: 'Louis Cole',
        date: new Date('10-12-2026'),
        time: '21:00',
        status: EventStatus.SCHEDULED,
    },
]

console.log (eventsList)

const listContainer = document.createElement('ul');
listContainer.innerHTML = eventsList.reduce((acc, event) => {
    return (
        acc + 
        `<li>${event.artist} - ${event.title} - ${event.date.toDateString()}</li>`
    );
}, '');

if(appContainer){
    appContainer.innerHTML = `
    <h1>NeonPulse</h1>
    <p>Entorno de desarrollo incializado con Vite y VanillaJS</p>
    `;
    appContainer.append(listContainer);
}
