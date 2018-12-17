// Run Maxmind only once per request, per user
// Inside your main app.js add pp.use(require('./middleware'))
//
// var express = require('express')
// app = express()
// app.use(require('./middleware'))

module.exports = () => {
  return (req, res, next) => {
    if(!req.session)
      return next(new Error('err'))
    req.session.ip = req.headers['x-real-ip']
    if(req.session.maxmind)
      return next()
    var maxmind = require('maxmind')
    if(!maxmind.validate(req.session.ip))
    	return res.send('Invalid IP').end()
    maxmind.open(require('geolite2').paths.city, (err, geo_ip) => {
      var city = geo_ip.get(req.session.ip)
      if(!city) {
        req.session.maxmind = 1
        return next()
      }
      if(city.country) {
        if(city.country.iso_code) {
          req.session.country = city.country.iso_code
        }
      }
      if(city.postal && !req.session.zip) {
    		if(city.postal.code)
    			req.session.zip = city.postal.code
        if(city.city && !req.session.city)
          req.session.city = city.city.names ? city.city.names.en : ''
        if(city.subdivisions)
          req.session.state = city.subdivisions[0].iso_code
        if(req.session.city) {
          req.session.city_state = req.session.city + ', ' + req.session.state
          res.locals.city_state = req.session.city_state  
        }
        if(city.location) {
          if(city.location.latitude)
            req.session.latitude = city.location.latitude
          if(city.location.longitude && !req.session.longitude)
            req.session.longitude = city.location.longitude
        }
      }
      req.session.maxmind = 1
      next()
    })
  }
}
