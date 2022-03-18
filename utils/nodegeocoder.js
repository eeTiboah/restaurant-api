const NodeGeocoder = require('node-geocoder')


const options = {
  provider: 'mapquest',
  apiKey: 'e2l0R1IszmePAK8s6ARbh9nmwctJmS18',
  formatter: null
}

const geocoder = NodeGeocoder(options)

module.exports = geocoder