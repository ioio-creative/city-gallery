import React, { useEffect, useRef } from 'react';
import {random} from '../globalFuncFor3d';
import Zdog from 'zdog';

const Section5 = (props) => {
    const canvasLeft = useRef(null);
    const canvasRight = useRef(null);
    const startFunc = useRef(null);
    const stopFunc = useRef(null);

    useEffect(()=>{
        const Coin = function(illo){
            const _this = this;
            this.vx = random(-2,2);
            this.vy = random(-20, -5);
            this.vz = random(-2,2);
            this.friction = random(.2, .4);
            this.garvity = 1;
            this.self = null;
            
            this.init = function(){
                _this.self = new Zdog.Cylinder({
                    addTo: illo,
                    diameter: random(window.innerWidth/2 *.033, window.innerWidth/2 *.059),
                    length: window.innerWidth/2 *.008,
                    stroke: false,
                    color: '#f2f583',
                    frontFace: '#e0de49',
                    backface: '#cdcb3a',
                    translate:{
                        x:window.innerWidth/2 *.045,
                        y:0
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
                    y:-25
                },
                rotate:{
                    x:-35 * Math.PI/180,
                    y:45 * Math.PI/180
                }
            });

            this.update = function(){
                _this.player = requestAnimationFrame( _this.update );

                for(let i=_this.coins.length; i<_this.numOfCoins; i++){
                    _this.coins.push(new Coin(_this.illo));
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
    },[])

    useEffect(()=>{
        if(props.detailIdx === 5){
            startFunc.current.start(5, 20);
        }
        else{
            stopFunc.current.stop();
        }
    },[props.detailIdx])

    return(
        <div id="section5" className={`section ${props.detailIdx === 5 ? 'active' : ''}`}>
            <div id="left" className="half">
                <div className="wrap">
                    <div className="title big">GDP per capita (nominal)</div>
                    <div className="big">48,915.89USD</div>
                    <canvas ref={canvasLeft} id="leftCanvas" width={window.innerWidth/2} height={window.innerHeight}></canvas>
                    <div className="source">
                        Source:<br/>HK Census And Statistics Department Population 2018<br/>Hong Kong Geographic Data 2019
                    </div>
                </div>
                <div className="bg"><span></span></div>
            </div>
            <div id="right" className="half">
                <div className="wrap">
                    <div className="title big">GDP per capita (nominal)</div>
                    <div className="big">74,266.31USD</div>
                    <canvas ref={canvasRight} id="rightCanvas" width={window.innerWidth/2} height={window.innerHeight}></canvas>
                    <div className="source">
                        Source:<br/>HK Census And Statistics Department Population 2018<br/>Hong Kong Geographic Data 2019
                    </div>
                </div>
                <div className="bg"><span></span></div>
            </div>
        </div>
    )
}

export default Section5;