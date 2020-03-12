import React, { useEffect, useRef } from 'react';
import {random} from '../globalFuncFor3d';
import gsap from 'gsap';
import car1 from '../images/car1.svg';
import car2 from '../images/car2.svg';
import car3 from '../images/car3.svg';
import ghostCar from '../images/ghostcar.svg';
import train from '../images/train.svg';

const Section4 = props => {
    const leftImageWrap = useRef(null);
    const rightImageWrap = useRef(null);
    const startFunc = useRef(null);
    const stopFunc = useRef(null);

    useEffect(()=>{
        const leftCarsImageURL = [
            car1, // small
            car2, // medium
            car3, // big
            ghostCar
        ]
        let leftCarsImageSize = [];
        const rightCarsImageURL = [
            car1, // small
            car1, // medium
            car1, // big
            ghostCar
        ]
        let rightCarsImageSize = [];
        let tll, tlr;


        const loadImage = () => {
            leftCarsImageSize = [];
            rightCarsImageSize = [];

            for(let i=0; i<leftCarsImageURL.length; i++){
                const src = leftCarsImageURL[i];
                const img = new Image();
                img.onload = function(){
                    leftCarsImageSize[i] = {width:0, height:0};
                    leftCarsImageSize[i].width = this.width;
                    leftCarsImageSize[i].height = this.height;
                }
                img.src = src;
            }

            for(let i=0; i<rightCarsImageURL.length; i++){
                const src = rightCarsImageURL[i];
                const img = new Image();
                img.onload = function(){
                    rightCarsImageSize[i] = {width:0, height:0};
                    rightCarsImageSize[i].width = this.width;
                    rightCarsImageSize[i].height = this.height;
                }
                img.src = src;
            }
        }

        const Car = function(elem, line, speed){
            const _this = this;
            this.self = null;
            this.type = Math.round(random(1,4)); // 1=small 2=medium 3=big 4=ghost
            this.line = line;
            this.pos = {x:0, y:0};
            this.speed = speed;
            let sizeArray = null;
            let imageArray = null;

            if(elem.getAttribute('id') === 'leftImageWrap'){
                sizeArray = leftCarsImageSize;
                imageArray = leftCarsImageURL;
            }
            else{
                sizeArray = rightCarsImageSize;
                imageArray = rightCarsImageURL;
            }
            
            this.width = sizeArray[_this.type-1].width;
            this.height = sizeArray[_this.type-1].height;

            this.init = function(){
                _this.self = document.createElement('div');
                const carimg = document.createElement('div');
                _this.self.className = `car line${_this.line}`;
                _this.self.appendChild(carimg);
                carimg.style.backgroundImage = `url(${imageArray[_this.type-1]})`;
                carimg.style.width = _this.width / 1920 * 100 + 'vw';
                carimg.style.height = _this.height / 1920 * 100 + 'vw';
                
                elem.appendChild(_this.self);
            }

            this.init();
        }
        Car.prototype.move = function(){
            this.pos.x += this.speed;
            this.pos.y += this.speed * 0.5733333333333334;
            this.self.style.transform = `translate3d(${this.pos.x}px,${this.pos.y}px,0)`;
        }

        const CarsAnim = function(elem){
            const _this = this;
            this.lines = [
                {
                    line1:{
                        cars:[],
                        startTime:0,
                        waitingTime:0
                    }
                },{
                    line2:{
                        cars:[],
                        startTime:0,
                        waitingTime:0
                    }
                }
            ];
            this.player = null;
            this.numOfCars = 6;
            this.density = 0;

            this.update = function(){
                _this.player = requestAnimationFrame(_this.update);
                const now = new Date();
                const density = (100 - _this.density) / 100;


                for(let i=0; i<_this.lines.length; i++){
                    const line = _this.lines[i][`line${i+1}`];
                    const lineTimer = now - line.startTime;

                    if(line.cars.length < _this.numOfCars){
                        if(line.cars.length > 0){
                            const prevCar = line.cars[line.cars.length-1];
    
                            line.waitingTime = prevCar.width*8.7 + prevCar.width*8.7 * density;// + random(0, prevCar.width*36.05) * density;
    
                            if(lineTimer > line.waitingTime){
                                line.cars.push(new Car(elem, i+1, i+2));
                                line.startTime = new Date();
                            }
                        }
                        else{
                            line.cars.push(new Car(elem, i+1, i+2));
                            const firstCar = line.cars[0];
                            line.waitingTime = firstCar.width*8.7 + firstCar.width*8.7 * density;// + random(0, firstCar.width*36.05) * density;
                            line.startTime = new Date();
                        }
                    }
                }
            

                for(let i=0; i<_this.lines.length; i++){
                    const line = _this.lines[i][`line${i+1}`];
                    for(let c=0; c<line.cars.length; c++){
                        const car = line.cars[c];
                        car.move();

                        if(car.pos.x > window.innerWidth/2 + car.width){
                            car.self.remove();
                            line.cars.splice(c,1);
                        }
                    }
                }
            }
        }
        CarsAnim.prototype.start = function(density){
            for(let i=0; i<this.lines.length; i++){
                const line = this.lines[i][`line${i+1}`];
                line.startTime = new Date();
            }
            this.density = density;
            this.update();
        }
        CarsAnim.prototype.stop = function(){
            if(this.player)
                cancelAnimationFrame(this.player);
        }


        const leftCars = new CarsAnim(leftImageWrap.current);
        const rightCars = new CarsAnim(rightImageWrap.current);

        const start = () => {
            leftCars.start(100);
            rightCars.start(10);
            tll = gsap.timeline({repeat:-1});
            tll.fromTo('#leftTrain', 5, {x:0,y:0}, {x:'28vw',y:'15vw', ease:'expo.inOut'});
            tll.to('#leftTrain', 5, {x:'100vw',y:'57vw', ease:'expo.in'});
            
            tlr = gsap.timeline({repeat:-1, delay:3});
            tlr.fromTo('#rightTrain', 5, {x:0,y:0}, {x:'28vw',y:'15vw', ease:'expo.inOut'});
            tlr.to('#rightTrain', 5, {x:'100vw',y:'57vw', ease:'expo.in'})
        }
        startFunc.current = {start};

        const stop = () => {
            leftCars.stop();
            rightCars.stop();
            if(tll) tll.kill();
            if(tlr) tlr.kill();
        }
        stopFunc.current = {stop}

        loadImage();
        
    },[]);

    // load image after changed location
    useEffect(()=>{
    },[])

    useEffect(()=>{
        if(props.detailIdx === 4){
            startFunc.current.start();
        }
        else{
            stopFunc.current.stop();
        }
    },[props.detailIdx])

    return(
        <div id="section4" className={`section ${props.detailIdx === 4 ? 'active' : ''}`}>
            <div id="left" className="half">
                <div className="wrap">
                    <div className="title medium">Percentage of Daily Trips <br/>by Public Transport</div>
                    <div className="big">88%</div>
                    <div ref={leftImageWrap} id="leftImageWrap" className="imageWrap">
                        <div id="leftTrain"><div style={{backgroundImage:`url(${train})`,width:858/1920*100+'vw', height:564/1920*100+'vw'}}></div></div>
                    </div>
                    <div className="source">
                        Source: <br/>The 2019 Deloitte City Mobility Index
                    </div>
                </div>
                <div className="bg"><span></span></div>
            </div>
            <div id="right" className="half">
                <div className="wrap">
                    <div className="title medium">Percentage of Daily Trips <br/>by Public Transport</div>
                    <div className="big">10%</div>
                    <div ref={rightImageWrap} id="rightImageWrap" className="imageWrap">
                        <div id="rightTrain"><div style={{backgroundImage:`url(${train})`,width:858/1920*100+'vw', height:564/1920*100+'vw'}}></div></div>
                    </div>
                    <div className="source">
                        Source:<br/> Land Transport Authority Of Singapore In <br/>November 2014
                    </div>
                </div>
                <div className="bg"><span></span></div>
            </div>
        </div>
    )
}

export default Section4;