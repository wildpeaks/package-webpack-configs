/* eslint-env browser */
import srcSmallJpg from './small.jpg';
import srcLargeJpg from './large.jpg';
import srcSmallPng from './small.png';
import srcLargePng from './large.png';
import srcSmallGif from './small.gif';
import srcLargeGif from './large.gif';

const mycontainer = document.createElement('div');
mycontainer.setAttribute('id', 'images');
document.body.appendChild(mycontainer);

const imgSmallJpg = document.createElement('img');
imgSmallJpg.src = srcSmallJpg;
mycontainer.appendChild(imgSmallJpg);

const imgLargeJpg = document.createElement('img');
imgLargeJpg.src = srcLargeJpg;
mycontainer.appendChild(imgLargeJpg);

const imgSmallPng = document.createElement('img');
imgSmallPng.src = srcSmallPng;
mycontainer.appendChild(imgSmallPng);

const imgLargePng = document.createElement('img');
imgLargePng.src = srcLargePng;
mycontainer.appendChild(imgLargePng);

const imgSmallGif = document.createElement('img');
imgSmallGif.src = srcSmallGif;
mycontainer.appendChild(imgSmallGif);

const imgLargeGif = document.createElement('img');
imgLargeGif.src = srcLargeGif;
mycontainer.appendChild(imgLargeGif);