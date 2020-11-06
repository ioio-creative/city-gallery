import React, { useEffect, useRef } from 'react';
import {random} from '../globalFuncFor3d';
import Zdog from 'zdog';
import gsap from 'gsap';

const Section5 = (props) => {
    const canvasLeft = useRef(null);
    const canvasRight = useRef(null);
    const startFunc = useRef(null);
    const stopFunc = useRef(null);

    const globalData = props.globalData;
    const data = props.data;
    const locationName = props.locationName;

    useEffect(()=>{
        const Coin = function(illo, direction){
            const _this = this;
            this.vx = random(-2,2);
            this.vy = random(-20, -5);
            this.vz = random(-2,2);
            // this.vx = 0;
            // this.vy = 0;
            // this.vz = 0;
            this.friction = random(.2, .4);
            this.garvity = 1;
            this.self = null;
            
            this.init = function(){
                _this.self = new Zdog.Cylinder({
                    addTo: illo,
                    diameter: random(window.innerWidth/2 *.033, window.innerWidth/2 *.059),
                    length: window.innerWidth/2 *.008,
                    stroke: false,
                    // color: '#f2f583',
                    // frontFace: '#e0de49',
                    // backface: '#cdcb3a',
                    color: '#937049',
                    frontFace: '#bf935d',
                    backface: '#bf935d',
                    translate:{
                        // x:window.innerWidth/2 *.05,
                        x: direction === "#leftCanvas" ? 170 : -130,
                        y: direction === "#leftCanvas" ? -200 : -60
                    },
                    rotate:{
                        x: random(0, Math.PI*2),
                        y: random(0, Math.PI*2),
                        z: random(0, Math.PI*2),
                    }
                })
            }

            this.init();
        }
        Coin.prototype.update = function(){
            this.self.translate.x += this.vx;
            this.self.translate.y += this.vy * this.friction;
            this.self.translate.z += this.vz;
            this.vy += this.garvity * this.friction;
            this.self.rotate.x += .01;
            this.self.rotate.y += .08;
        }

        

        // const plane = new Zdog.Box({
        //     addTo: illo,
        //     width: 120,
        //     height: 1,
        //     depth: 120,
        //     stroke: false,
        //     color: '#C25', // default face color
        //     leftFace: false,
        //     rightFace: false,
        //     frontFace:false,
        //     rearFace:false,
        //     topFace: '#f00',
        //     bottomFace: false,
        // });

        const CoinAnim = function(canvasElem){
            const _this = this;
            this.coins = [];
            this.player = null;
            this.illo = new Zdog.Illustration({
                element: canvasElem,
                zoom: 1.5,
                resize: true,
                translate:{
                    y:-15
                },
                rotate:{
                    x:-35 * Math.PI/180,
                    y:45 * Math.PI/180
                }
            });
            this.update = function(){
                _this.player = requestAnimationFrame( _this.update );


                for(let i=_this.coins.length; i<_this.numOfCoins; i++){
                    _this.coins.push(new Coin(_this.illo, canvasElem));
                }

                for(let i=0; i<_this.coins.length; i++){
                    const coin = _this.coins[i];
                    coin.update();
                    
                    if(coin.self.translate.y > 100){
                        coin.self.remove();
                        _this.coins.splice(i,1);
                    }
                }

                _this.illo.updateRenderGraph();
            }
        }

        CoinAnim.prototype.start = function(numOfCoins){
            this.numOfCoins = numOfCoins;
            this.update();
        }
        CoinAnim.prototype.stop = function(){
            if(this.player)
                cancelAnimationFrame(this.player);
        }

        // const createCoins = (elems) => {
        //     const pos = [];
        //     const coins = elems;
        //     let tooClose = false;
        //     const navHeight = document.querySelector('#nav').offsetHeight;
        //     const margin = 1920 * .05;
        //     console.log("hihi", coins.length);
        //     for(let i=0; i<coins.length; i++){
        //         const coin = coins[i];
        //         const coinWidth = coin.offsetWidth;
        //         const coinHeight = coin.offsetHeight;
        //         const _pos = {x:random(margin,1920/2-margin), y:random(window.innerHeight/2, window.innerHeight)};
        //         console.log(_pos);
                
        //         tooClose = false;

        //         const a = _pos.x - (1920/2/2.2);
        //         const b = _pos.y - (window.innerHeight/1.3);
        //         const dist = Math.sqrt(a*a + b*b);

        //         if(dist < 200){
        //             --i;
        //             tooClose = true;
        //             continue;
        //         }

        //         if(!tooClose){
        //             pos[i] = {x:_pos.x - coinWidth/2, y:_pos.y - coinHeight/2};
        //             // gsap.set(coin, {left:(1920/2/2.2)/1920*100+'vw', top:(window.innerHeight/1.3)/1920*100+'vw'});
        //             // gsap.set(coin, {force3D:true, left:(pos[i].x/1920*100)+'vw', top:(pos[i].y/1920*100)+'vw', scale:random(.8,1.1)});
        //             gsap.set(coin, {force3D:true, left:(pos[i].x/1920*100)+'vw', top:31.25+'vw', scale:random(.8,1.1)});

        //         }
        //     }
        // }

        // createCoins(document.querySelectorAll('#left .coins span'));
        // createCoins(document.querySelectorAll('#right .coins span'));


        const leftCanvas = new CoinAnim('#leftCanvas');
        const rightCanvas = new CoinAnim('#rightCanvas');
        
        const start = (leftNum, rightNum) => {
            leftCanvas.start(leftNum);
            rightCanvas.start(rightNum);
        }
        startFunc.current = {start};

        const stop = () => {
            leftCanvas.stop();
            rightCanvas.stop();
        }
        stopFunc.current = {stop}
    },[locationName])

    useEffect(()=>{
        if(locationName){
            if(props.detailIdx === 5){
                startFunc.current.start(382046/1000 * .3, data[locationName].money.replace(',','')/1000 * .3);
                // startFunc.current.start(1, 1);
            }
            else{
                stopFunc.current.stop();
            }
        }
    },[props.detailIdx, locationName])

    return(
        <div id="section5" className={`section ${props.detailIdx === 5 ? 'active' : ''}`}>
            <div id="left" className="half">
                <div className="wrap">
                    <div className='gdpbg' style={{backgroundImage:`url(./images/exG02a/section5/hongkonggdp.png)`}}></div>
                    <img src="./images/exG02a/section5/hkcoin20.png" style={{bottom: -43, right: 143}}></img>
                    <img src="./images/exG02a/section5/hkcoin11.png" style={{bottom: 188, left: 19}}></img>
                    <img src="./images/exG02a/section5/hkcoin11.png" style={{bottom: 383, right: 108}}></img>
                    <img src="./images/exG02a/section5/hkcoin10.png" style={{bottom: '332px', right: '24px'}}></img>
                    <img src="./images/exG02a/section5/hkcoin2.png" style={{bottom: 30+'px', left: 228+'px'}}></img>
                    <div className="title big">{globalData && globalData.gdp}</div>
                    <div className="big">{ data && data['hongkong'].money }HKD</div>
                    <canvas ref={canvasLeft} id="leftCanvas" width="600" height="600"></canvas>
                    {/* <div className="coins">
                        {
                            [...Array(5)].map((v,i)=>{
                                return <span key={i}></span>
                            })
                        }
                    </div> */}
                    <div className="source">
                        {globalData && globalData.source}<br/><span dangerouslySetInnerHTML={{__html:data && data['hongkong'].source}}></span>
                    </div>
                </div>
                <div className="bg"><span></span></div>
            </div>
            <div id="right" className="half">
                <div className="wrap">
                    <div className='gdpbg' style={{backgroundImage:`url(./images/exG02a/section5/${locationName}gdp.png)`}}></div>
                    <img src="./images/exG02a/section5/other1.png" style={{bottom: -43, right: 643}}></img>
                    <img src="./images/exG02a/section5/other1.png" style={{bottom: 288, right: 16}}></img>
                    <img src="./images/exG02a/section5/other2.png" style={{bottom: 419, right: 308}}></img>
                    <img src="./images/exG02a/section5/other3.png" style={{bottom: '32px', right: '130px'}}></img>
                    <img src="./images/exG02a/section5/other4.png" style={{bottom: 230+'px', left: 44+'px'}}></img>
                    <div className="title big">{globalData && globalData.gdp}</div>
                    <div className="big">{ data && locationName && data[locationName].money }HKD</div>
                    <canvas ref={canvasRight} id="rightCanvas" width="600" height="600"></canvas>
                    {/* <div className="coins">
                        {
                            [...Array(20)].map((v,i)=>{
                                return <span key={i}></span>
                            })
                        }
                    </div> */}
                    <div className="source">
                        {globalData && globalData.source}<br/><span dangerouslySetInnerHTML={{__html:data && locationName && data[locationName].source}}></span>
                    </div>
                </div>
                <div className="bg"><span></span></div>
            </div>
        </div>
    )
}

export default Section5;