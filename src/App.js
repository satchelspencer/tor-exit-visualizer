import React, { Component } from 'react';
import io from 'socket.io-client';
import h from 'hilbert-2d';
import { injectGlobal } from 'styled-components';

injectGlobal`
  Body{
    position:absolute;
    top:0;
    left:0;
    width:100%;
    height:100%;
    margin:0;
    background:black;
  }
`

const socket = io('http://158.69.172.224:9999/');
const ip2num = (ip) => ip.split('.').reverse().reduce((total, num, i) => total+(parseInt(num, 10)<<(i*7)),0)


class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      ips : {}
    }
  }
  componentDidMount(){

    socket.on('ips', (ips) => {
      const allips = {...this.state.ips}
      ips.forEach(ip => {
        if(!this.state.ips[ip]){
          const coords = h.decode(16, ip2num(ip)).map(v => v/32768);
          allips[ip] = {
            coords,
            state : -Math.random()*100
          }
        }
        allips[ip].state = -Math.random()*100
      })
      this.setState({ips : allips})
    });
    const up = () => {
      const allips = {...this.state.ips}
      Object.keys(allips).forEach(ip => {
        allips[ip].state += 1;
        if(allips[ip].state > 100) delete allips[ip];
      })
      this.setState({ips : allips});
      // setTimeout(up, 100)
      requestAnimationFrame(up);
    }
    up();
  }
  render() {
    // console.log(Object.keys(this.state.ips).length)
    return (
      <div className="App">
        {Object.keys(this.state.ips).map(ip => {
          const thisip = this.state.ips[ip];
          const x = thisip.coords[0]*window.innerWidth; 
          const y = thisip.coords[1]*window.innerHeight*2; 
          return thisip.state > 0 && (
            <div 
              key={ip}
              style={{
                opacity : 1-(Math.abs((thisip.state-50))/50),
                position:'absolute',
                top : y-2,
                left : x-2,
                width : 5,
                height : 5,
                background:'white',
                borderRadius : '50%'
              }}
            />
          )
        })}
      </div>
    );
  }
}

export default App;
