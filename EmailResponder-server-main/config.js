//
// config.js
//
// Web service configuration parameters, separate
// from our photoapp-config file that contains 
// AWS-specific configuration information.
//

const config = {
    emailresponder_config: "emailresponder-config.ini",
    emailresponder_profile: "get AWS profile here",
    service_port: 3000,
    page_size: 12
};

module.exports = config;