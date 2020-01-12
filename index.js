const _ = require('lodash')
var noam = require('./lib/node/noam')
const rl = require('readline')
const ask = function (question) {
  var rl = require('readline');
  var r = rl.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });
  return new Promise((resolve, error) => {
    r.question(question, answer => {
      r.close();
      resolve(answer);
    });
  })
};
console.reset = function () {
  return process.stdout.write('\033c');
}

let quintupla = 
``
let estadosFinales = []

const labelQuintupla = (label, first=false) => first ? quintupla += `#${label}` : quintupla += `\n#${label}`
const addToQuintupla = (value) => quintupla += `\n${value}`

const ingresarQuintupla = async () => {
  //Ingreso de Estados
  let states = await ask('Ingrese los estados separados por coma: ')
  states = states.split(',')
  labelQuintupla('states', true)
  states.forEach(state => addToQuintupla(state))
  //Ingreso de Estado inicial
  let initialState = await ask('Ingrese estado inicial: ')
  labelQuintupla('initial')
  if(states.indexOf(initialState) >= 0) addToQuintupla(initialState)
  else console.log('No existe el estado.. por el momento se cae (arreglar)')
  //Ingreso de Estado final
  let finalStates = await ask('Ingrese estado(s) final(es) [separados por coma]: ')
  labelQuintupla('accepting')
  finalStates = finalStates.split(',')
  if(_.isArray(finalStates)) finalStates.forEach(state => {
    addToQuintupla(state)
    estadosFinales = [...estadosFinales, state]
  })
  else {
    addToQuintupla(finalStates)
    estadosFinales = [...estadosFinales, finalStates]
  }
  //Ingreso del alfabeto
  let alfabeto = await ask('Ingrese alfabeto aceptado separado por coma: ')
  labelQuintupla('alphabet')
  alfabeto = alfabeto.split(',')
  alfabeto.forEach(letra => addToQuintupla(letra))
  //Ingreso de transiciones
  let transiciones = await ask('Ingrese transiciones [origen:letra>destino] ($ para vacios) separados por espacio: ')
  labelQuintupla('transitions')
  transiciones = transiciones.split(' ')
  transiciones.forEach(transicion => addToQuintupla(transicion))

  //crearAutomata
  return createAutomata(quintupla)
}

createAutomata = (quintupla) => {
  let automata = noam.fsm.parseFsmFromString(quintupla)
  // automata = noam.fsm.minimize(automata)
  return automata
} 

const AFNDtoAFD = (automata) => {
  let nuevoAutomata = automata
  let type = noam.fsm.determineType(automata)
  if(type === noam.fsm.nfaType) {
    // nuevoAutomata = noam.fsm.convertNfaToDfa(automata)
    // nuevoAutomata = noam.fsm.removeUnreachableStates(nuevoAutomata)
    nuevoAutomata = noam.fsm.minimize(nuevoAutomata)
    showQuintupla(nuevoAutomata)
  }
  else if(type === noam.fsm.enfaType) {
    // nuevoAutomata = noam.fsm.convertEnfaToNfa(automata)
    // nuevoAutomata = noam.fsm.convertNfaToDfa(nuevoAutomata)
    // nuevoAutomata = noam.fsm.removeUnreachableStates(nuevoAutomata)
    nuevoAutomata = noam.fsm.minimize(nuevoAutomata)
    showQuintupla(nuevoAutomata)
  }
  else console.log('El automata ingresado ya es un AFD')
  return nuevoAutomata
}

const AFDminimo = (automata) => {
  let AFDminimizado = noam.fsm.minimize(automata)
  showQuintupla(AFDminimizado)
  return AFDminimizado
}
const showQuintupla = (automata) => {
  let quintupla = noam.fsm.serializeFsmToString(automata)
  //Reemplazando las palabra en ingles
  quintupla = _.replace(quintupla, 'states', 'Estados')
  quintupla = _.replace(quintupla, 'initial', 'Inicial')
  quintupla = _.replace(quintupla, 'accepting', 'Final(es)')
  quintupla = _.replace(quintupla, 'alphabet', 'Alfabeto')
  quintupla = _.replace(quintupla, 'transitions', 'Transiciones')
  console.log(quintupla)
}

const menu = () => {
  console.reset()
  console.log('1. Ingresar quintupla')
  console.log('2. Ingresar palabra')
  console.log('3. Obtener AFD equivalente')
  console.log('4. AFD minimo')
  console.log('5. Salir')
}

const readString = (automata, palabra) => {
  if(quintupla === '') console.log('Primero debe ingresar un automata')
  else {
    lastState = noam.fsm.readString(automata, palabra)
    if(_.indexOf(estadosFinales, lastState[0]) === -1) console.log('La palabra NO pertenece al lenguaje')
    else console.log('La palabra pertenece al lenguaje')
  }
}


//Programa
const main = async () => {
  let automata = null
  while(true) {
    menu()
    let option = await ask('Eliga una opción: ')
    switch (option) {
      case '1':
        console.reset()
        quintupla = ``
        estadosFinales = []
        automata = await ingresarQuintupla()
        break;
      case '2':
        console.reset()
        let palabra = await ask('Ingrese la palabra: ')
        readString(automata, palabra)
        await ask('')
        break;
      case '3':
        automata = AFNDtoAFD(automata)
        await ask('')
        break
      case '4':
        automata = AFDminimo(automata)
        await ask('')
        break
      case '5':
        return false
      default:
        console.log('Opcion no válida')
        await ask('')
        break;
    }
  }
  // console.log('MINIMO: ', noam.fsm.serializeFsmToString(automata))
  console.log(noam.fsm.readString(automata, 'aaa'))
}

main()
