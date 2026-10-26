//Fonction utilistaires
"use strict";
let __DEBUG__ = false;
function __DB(txt){
    if (__DEBUG__) console.log(txt);
}
function _qs(selector){ return document.querySelector(selector) }
function _qSa(selector){ return document.querySelectorAll(selector) }
function _gebi(id){ return document.getElementById(id)}