import React, { Component } from 'react'
import Slider from '../src/slider'

export default class MultipleItems extends Component {
  render() {
    const settings = {
      dots: true,
      infinite: true,
      speed: 500,
      slidesToShow: 3,
      slidesToScroll: 3
    };
    var items = [ 1, 2, 3, 4, 5 ]
    return (
      <div>
        <h2> Multiple items Dynamic </h2>
        <Slider {...settings}>
          { items.map( item => {
            return (
              <div key={item}><h3>{item}</h3></div>
            )
          })}
        </Slider>
      </div>
    );
  }
}