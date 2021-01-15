import React, { useEffect, useRef } from 'react';
import {random} from '../globalFuncFor3d';
import gsap from 'gsap';
// import car1 from '../images/car1.svg';
// import car2 from '../images/car2.svg';
// import car3 from '../images/car3.svg';
// import ghostCar from './images/exG02a/section4/ghostcar.svg';
// import train from '../images/train.svg';

const Section4 = props => {
    const leftImageWrap = useRef(null);
    const rightImageWrap = useRef(null);
    const startFunc = useRef(null);
    const stopFunc = useRef(null);
    const loadImageFunc = useRef(null);

    const globalData = props.globalData;
    const data = props.data;
    const locationName = props.locationName;

    useEffect(()=>{
        if(locationName){
            const leftCarsImageURL = [
                ...data['hongkong'].carimages,
                './images/exG02a/section4/ghostcar.svg'
            ]
            const rightCarsImageURL = [
                ...data[locationName].carimages,
                './images/exG02a/section4/ghostcar.svg'
            ]
            let leftCarsImageSize = [];
            let rightCarsImageSize = [];
            let tll, tlr;
            let removed = true;


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
            loadImageFunc.current = {loadImage}

            const Car = function(elem, line, idx){
                const _this = this;
                this.self = null;
                this.line = line;
                this.pos = {x:0, y:0};
                this.speed = line === 1 ? 2 : 4;
                let sizeArray = null;
                let imageArray = null;
                this.stopMoving = idx === 0 ? false : true;

                if(elem.id === 'leftImageWrap'){
                    sizeArray = leftCarsImageSize;
                    imageArray = leftCarsImageURL;
                    this.type = Math.round(random(1,sizeArray.length)); // 1=small 2=medium 3=big 4=ghost
                }
                else{
                    sizeArray = rightCarsImageSize;
                    imageArray = rightCarsImageURL;
                    this.type = Math.round(random(1,sizeArray.length)); // 1=small 2=medium 3=big 4=ghost
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
                if(!this.stopMoving){
                    this.pos.x += this.speed;
                    this.pos.y += this.speed * 0.5733333333333334;
                    gsap.set(this.self, {x:this.pos.x, y:this.pos.y});
                }
                // this.self.style.transform = `translate3d(${this.pos.x}px,${this.pos.y}px,0)`;
            }
            Car.prototype.drive = function(){
                this.stopMoving = false;
            }
            Car.prototype.stop = function(){
                this.stopMoving = true;
            }

            const CarsAnim = function(elem){
                const _this = this;
                this.elem = elem;
                this.lines = [
                    {
                        line1:{
                            cars:[],
                            drivingInCarIdx:0
                            // startTime:0,
                            // waitingTime:0
                        }
                    },{
                        line2:{
                            cars:[],
                            drivingInCarIdx:0
                            // startTime:0,
                            // waitingTime:0
                        }
                    }
                ];
                this.player = null;
                this.numOfCars = 3;
                // this.density = 0;

                this.update = function(){
                    _this.player = requestAnimationFrame(_this.update);
                    // const now = new Date();
                    // const density = (100 - _this.density) / 100;
                    const lth =_this.lines.length;

                    // for(let i=0; i<lth; i++){
                    //     const line = _this.lines[i][`line${i+1}`];
                        // const lineTimer = now - line.startTime;

                        // if(line.cars.length < _this.numOfCars){
                            // if(line.cars.length > 0){
                            //     const prevCar = line.cars[line.cars.length-1];
        
                            //     line.waitingTime = prevCar.width*8.7 + prevCar.width*8.7 * density;// + random(0, prevCar.width*36.05) * density;
        
                            //     if(lineTimer > line.waitingTime){
                            //         line.cars.push(new Car(elem, i+1, i+2));
                            //         line.startTime = new Date();
                            //     }
                            // }
                            // else{
                                // line.cars.push(new Car(elem, i+1, i+2));
                                // const firstCar = line.cars[0];
                                // line.waitingTime = firstCar.width*8.7 + firstCar.width*8.7 * density;// + random(0, firstCar.width*36.05) * density;
                                // line.startTime = new Date();
                            // }
                        // }
                    // }
                

                    for(let i=0; i<lth; i++){
                        const line = _this.lines[i][`line${i+1}`];
                        const carlth = line.cars.length;


                        for(let c=0; c<carlth; c++){
                            const car = line.cars[c];
                            const drivingInCar = line.cars[line.drivingInCarIdx];

                            car.move();

                            if(drivingInCar.pos.x - drivingInCar.width >= window.innerWidth*.1){
                                line.drivingInCarIdx+1 < _this.numOfCars ? line.drivingInCarIdx++ : line.drivingInCarIdx=0;
                                line.cars[line.drivingInCarIdx].drive();
                            }

                            if(car.pos.x - car.width > window.innerWidth/2){
                                car.pos = {x:0, y:0}
                                car.stop();
                            }
                        }
                    }
                }
            }
            CarsAnim.prototype.start = function(isRemoved){
                if(isRemoved){
                    for(let i=0, lth=this.numOfCars; i<lth; i++){
                        const line1 = this.lines[0][`line${0+1}`];
                        const line2 = this.lines[1][`line${1+1}`];
                        line1.cars.push(new Car(this.elem, 1, i));
                        line2.cars.push(new Car(this.elem, 2, i));
                    }
                }
                this.update();
            }
            CarsAnim.prototype.stop = function(){
                if(this.player)
                    cancelAnimationFrame(this.player);
            }


            const leftCars = new CarsAnim(leftImageWrap.current);
            const rightCars = new CarsAnim(rightImageWrap.current);

            const removeCar = () => {
                removed = true;
                const cars = document.querySelectorAll('.imageWrap .car');
                for(let i=0; i<cars.length; i++){
                    cars[i].remove();
                }
            }

            const start = () => {
                leftCars.start(removed);//.start(data['hongkong'].percentage);
                rightCars.start(removed);//.start(data[locationName].percentage);
                removed = false;
                tll = gsap.timeline({repeat:-1});
                tll.fromTo('#leftTrain', 5, {x:0,y:0}, {x:'28vw',y:'15vw', ease:'expo.inOut'});
                tll.to('#leftTrain', 5, {x:'100vw',y:'57vw', ease:'expo.in'});
                
                tlr = gsap.timeline({repeat:-1, delay:3});
                tlr.fromTo('#rightTrain', 5, {x:0,y:0}, {x:'28vw',y:'15vw', ease:'expo.inOut'});
                tlr.to('#rightTrain', 5, {x:'100vw',y:'57vw', ease:'expo.in'})
            }
            startFunc.current = {start};

            const stop = () => {
                if(leftCars)leftCars.stop();
                if(rightCars)rightCars.stop();
                if(tll) tll.kill();
                if(tlr) tlr.kill();
            }
            stopFunc.current = {stop}

            stop();
            removeCar();
            loadImage();
        }
    },[locationName]);

    // load image after changed location
    useEffect(()=>{
    },[])

    useEffect(()=>{
        if(props.detailIdx === 4){
            if(startFunc.current) startFunc.current.start();
        }
        else{
            if(stopFunc.current) stopFunc.current.stop();
        }
    },[props.detailIdx])

    return(
        <div id="section4" className={`section ${props.detailIdx === 4 ? 'active' : ''}`}>
            <div id="left" className="half">
                <div className="wrap">
                    <div className="title medium" dangerouslySetInnerHTML={{__html:globalData && globalData.dailyTrips}}></div>
                    <div className="big">{ data && data['hongkong'].percentage }%</div>
                    <div ref={leftImageWrap} id="leftImageWrap" className="imageWrap">
                        <div id="leftTrain"><div style={{backgroundImage:`url(./images/exG02a/section4/hongkongtrain.svg)`,width:858/1920*100+'vw', height:564/1920*100+'vw'}}></div></div>
                        {/* <div id="leftTrain"><div style={{backgroundImage:`url(./images/exG02a/section4/hongkongtrain.svg)`,width:44.0875+'vw', height:31.875+'vw'}}></div></div> */}
                    </div>
                    <div id="bg">
                        <div id="train"></div>
                        <div id="road"></div>
                    </div>
                    <div className="source">
                        {globalData && globalData.source}<br/><span dangerouslySetInnerHTML={{__html: data && data['hongkong'].source}}></span>
                    </div>
                </div>
                <div className="bg"><span></span></div>
            </div>
            <div id="right" className="half">
                <div className="wrap">
                    <div className="title medium" dangerouslySetInnerHTML={{__html:globalData && globalData.dailyTrips}}></div>
                    <div className="big">{ data && locationName && data[locationName].percentage }%</div>
                    <div ref={rightImageWrap} id="rightImageWrap" className="imageWrap">
                        <div id="rightTrain"><div style={{backgroundImage:`url(./images/exG02a/section4/${locationName}train.svg)`,width:858/1920*100+'vw', height:564/1920*100+'vw'}}></div></div>
                        {/* <div id="rightTrain"><div style={{backgroundImage:`url(./images/exG02a/section4/${locationName}train.svg)`,width:46.6875+'vw', height:33.375+'vw'}}></div></div> */}
                    </div>
                    <div id="bg">
                        <div id="train"></div>
                        <div id="road"></div>
                    </div>
                    <div className="source">
                        {globalData && globalData.source}<br/><span dangerouslySetInnerHTML={{__html: data && locationName && data[locationName].source}}></span>
                    </div>
                </div>
                <div className="bg"><span></span></div>
            </div>
        </div>
    )
}

export default Section4;