import React, { Component } from 'react';
import io from 'socket.io-client';
import h from 'hilbert-2d';
import { injectGlobal } from 'styled-components';

//import intpng from './int.png';

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

function ip2num(ip) {
    return ip.split('.').reduce(function(ipInt, octet) { return (ipInt<<8) + parseInt(octet, 10)}, 0) >>> 0;
}

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
          const coords = h.decode(16, ip2num(ip)).map(v => v/65536);
          allips[ip] = {
            coords,
            state : -Math.random()*300,
            count : 1
          }
        }else{
           allips[ip] = {
            ...allips[ip],
            count : allips[ip].count+1
          }
        }
      })
      this.setState({ips : allips})
    });
    const up = () => {
      const allips = {...this.state.ips}
      Object.keys(allips).forEach(ip => {
        allips[ip].state += 1;
        if(allips[ip].state > 200){
          allips[ip].state = -Infinity;
        };
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
      <div 
        className="App"
        onMouseMove={(e) => {
          // const coords = [e.clientX/window.innerWidth*65536, e.clientY/(window.innerHeight)*65536]
          // const intip = h.encode(16, coords);
          // const ip = num2ip(intip);
          // console.log(ip)
        }}
        style={{
          position:'absolute',
          width : '100%',
          height : '100%',
          filter: 'blur(1px)'
        }}
      >
        {Object.keys(this.state.ips).map(ip => {
          const thisip = this.state.ips[ip];
          const x = thisip.coords[0]*window.innerWidth; 
          const y = thisip.coords[1]*window.innerHeight; 
          const size = 5;
          return thisip.state > 0 && (
            <div 
              key={ip}
              style={{
                opacity : 1-(Math.abs((thisip.state-100))/100),
                position:'absolute',
                top : y-(size/2),
                left : x-(size/2),
                width : size,
                height : size,
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
