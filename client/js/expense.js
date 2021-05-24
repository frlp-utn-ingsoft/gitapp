import {
    getRefs,
    render
} from './render.js';
import movementService from './movement-service.js';


let state = {
    movements: [],
    movement: {},
    hasEdit: true,
};

let refs = getRefs(document.body);

/**
 * Obtiene todos los ultimos movimientos disponibles
 **/
async function getExpenses() {
    return movementService.getExpenses();
}

/**
 * Renderiza los libros
 **/
function renderExpenses(state) {
    render('movement-list.html', state, refs.expenses);
}

/**
 * Inicializa la vista income
 **/
async function init() {
    state.movements = await getExpenses();
    renderExpenses(state);
}

function getMovementData() {
    const formData = new FormData(refs.form.firstElementChild);
    const movement = Object.fromEntries(formData);
    movement.type = "expense"
    return movement;
}

// Event Listeners

/**
 * Agrega un movimiento a edicion
 **/
window.editMovement = function (movement) {
    state.movement = movement;
    render('movement-form.html', state, refs.form);
};

/**
 * Cancela una edicion o creación
 **/
window.onCancel = function () {
    state.movement = {};
    render('movement-form.html', state, refs.form);
};

/**
 * Elimina un movimiento
 Cambios aplicados para que se pueda borrar
 **/
window.onRemove = async function () {
    await movementService.remove(state.movement);
    state.movement = {};
    render('movement-form.html', state, refs.form);
};

/**
 * Guarda un movimiento
 **/
window.onSave = async function (e) {
    e.stopPropagation();
    const form = document.querySelector('form');
    form.addEventListener('submit', window.onSave)
    if (!form.checkValidity()) {
        return;
    }
    e.preventDefault();
    const movement = getMovementData();
    if (movement.id) {
        await movementService.update(movement);
    } else {
        await movementService.create(movement);
    }
    state.movement = {};
    window.location.reload();
    render('movement-form.html', state, refs.form);
};

init();