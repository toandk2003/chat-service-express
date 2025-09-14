const Snowflake = require('snowflake-id').default;

class SnowflakeGenerator {
    constructor() {
        this.generator = new Snowflake({
        mid : process.env.NODE_ID,
        offset : (2025-1970)*31536000*1000
        });
    }
    
    // Generate new Snowflake ID
    generate() {
        return this.generator.generate();
    }
}

// Singleton instance
module.exports = new SnowflakeGenerator();