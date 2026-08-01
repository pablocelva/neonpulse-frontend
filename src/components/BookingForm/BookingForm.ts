export function renderBookingForm(): string {
    return `
        <section class="">
            <h2>Reserva de Entradas</h2>
            <form id="form-reserva" class"">
                <div class="">
                    <label for="email" class="">Email</label>
                    <input type="email" id="email" name="email" class="" placeholder="">
                </div>
            </form>
        </section>
    `
}