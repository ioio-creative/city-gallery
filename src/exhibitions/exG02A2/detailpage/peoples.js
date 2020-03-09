import {random, calcThetaPhiFromLatLon} from '../globalFuncFor3d';
import gsap from 'gsap';


const People = function(stageElem){
    const _this = this;
    this.id = Math.round(random(1,4));
    this.startAtTop = Math.round(random(0,1));
    this.startAtLeft = Math.round(random(0,1));
    this.self = null;
    this.body = null;
    this.width = null;
    this.height = null;
    this.pos = {x:0, y:0};
    this.speed = {x:random(.1, .7), y:random(.1, .5)};
    this.stageSize = stageElem.offsetWidth;
    this.offset = this.stageSize * .15;
    this.outOfArea = false;

    this.init = function(){
        _this.self = document.createElement('div');
        _this.self.setAttribute('id','_'+_this.id);
        _this.self.className = `people ${_this.startAtLeft?'right':'left'}`;
        _this.body = document.createElement('div');
        _this.body.style.opacity = 0;
        _this.self.appendChild(_this.body);
        stageElem.appendChild(_this.self);
        _this.width = _this.self.offsetWidth;
        _this.height = _this.self.offsetHeight;

        if(_this.startAtTop){
            if(_this.startAtLeft){
                _this.pos.x = 0;
                _this.pos.y = random(_this.offset, _this.stageSize-_this.height);
            }
            else{
                _this.pos.x = random(_this.offset, _this.stageSize);
                _this.pos.y = -_this.height*.5;
            }
        }
        else{
            if(_this.startAtLeft){
                _this.pos.x = random(_this.height, _this.stageSize-_this.offset-_this.height);
                _this.pos.y = _this.stageSize - _this.height;
            }
            else{
                _this.pos.x = _this.stageSize-_this.height*.3;
                _this.pos.y = random(-_this.height, _this.stageSize-_this.offset-_this.height);
            }
        }

        gsap.to(_this.body, .2, {autoAlpha:1, ease:'power1.inOut'});
    }

    this.walk = function(){
        if(_this.startAtLeft){
            _this.pos.x += _this.speed.x;
            _this.pos.y -= _this.speed.y;
        }
        else{
            _this.pos.x -= _this.speed.x;
            _this.pos.y += _this.speed.y;
        }

        _this.self.style.transform = `translate3d(${_this.pos.x}px,${_this.pos.y}px,0) rotateX(-90deg)`;
    }

    this.init();
}

const PeoplesAnim = function(stageElem){
    const _this = this;
    this.peoples = [];
    this.player = null;
    this.numOfPeoples = 0;
    this.stageSize = stageElem.offsetWidth;
    this.update = function(){
        // const currentPeoples = [];
        _this.player = requestAnimationFrame(_this.update);

        if(_this.peoples.length < _this.numOfPeoples){
            _this.peoples.push(new People(stageElem));
        }

        for(let i=0; i<_this.peoples.length; i++){
            const people = _this.peoples[i];
            people.walk();


            if(people.pos.x > _this.stageSize-people.width/2 || people.pos.y < 0-people.height+people.width/2 || 
                people.pos.x < 0 || people.pos.y > _this.stageSize-people.height)
            {
                if(!people.outOfArea){
                    people.outOfArea = true;
                    gsap.to(people.body, .2, {autoAlpha:0, ease:'power1.inOut', 
                        onComplete:function(){
                            people.self.remove();
                            const idx = _this.peoples.indexOf(people);
                            _this.peoples.splice(idx,1);
                        }
                    })
                }
            }
        }
    }
}

PeoplesAnim.prototype.start = function(numOfPeoples){
    this.numOfPeoples = numOfPeoples;
    this.update();
}

PeoplesAnim.prototype.stop = function(){
    if(this.player)
        cancelAnimationFrame(this.player);
}

export default PeoplesAnim;