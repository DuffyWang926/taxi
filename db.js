const Sequelize = require('sequelize');

const uuid = require('uuid');

const config = require('./config');


function generateId() {
    return uuid.v4();
}

var sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
    pool: {
        max: 15,
        min: 0,
        idle: 10000
    }
});

const ID_TYPE = Sequelize.STRING(50);

function defineModel(name, attributes) {
    var attrs = {};
    console.log('attributes', attributes)
    for (let key in attributes) {
        let value = attributes[key];
        console.log('value', value)
        if (typeof value === 'object' && value['type']) {
            value.allowNull = value.allowNull || false;
            
    
            // 添加默认值
            if (value.defaultValue === undefined) {
                if (value.type === Sequelize.STRING) {
                    value.defaultValue = '';
                } else if (value.type === Sequelize.INTEGER) {
                    value.defaultValue = 0;
                }
            }
    
            attrs[key] = value;
            console.log('key', key)
            console.log('attrs[key]', attrs[key])
        } else {
            attrs[key] = {
                type: value,
                allowNull: false,
                defaultValue: value === Sequelize.STRING ? '' : 0 // 设置默认值
            };
            console.log('attrs[key]2', attrs[key])
        }
    }
    
    attrs.id = {
        type: ID_TYPE,
        primaryKey: true
    };
    // attrs.createdAt = {
    //     type: Sequelize.BIGINT,
    //     allowNull: false
    // };
    // attrs.updatedAt = {
    //     type: Sequelize.BIGINT,
    //     allowNull: false
    // };
    // attrs.version = {
    //     type: Sequelize.BIGINT,
    //     allowNull: false
    // };
    // console.log('model defined for table: ' + name + '\n' + JSON.stringify(attrs, function (k, v) {
    //     if (k === 'type') {
    //         for (let key in Sequelize) {
    //             if (key === 'ABSTRACT' || key === 'NUMBER') {
    //                 continue;
    //             }
    //             let dbType = Sequelize[key];
    //             if (typeof dbType === 'function') {
    //                 if (v instanceof dbType) {
    //                     if (v._length) {
    //                         return `${dbType.key}(${v._length})`;
    //                     }
    //                     return dbType.key;
    //                 }
    //                 if (v === dbType) {
    //                     return dbType.key;
    //                 }
    //             }
    //         }
    //     }
    //     return v;
    // }, '  '));
    return sequelize.define(name, attrs, {
        tableName: name,
        timestamps: false,
        hooks: {
            beforeValidate: function (obj) {
                let now = Date.now();
                if (obj.isNewRecord) {
                    console.log('will create entity...' + obj);
                    if (!obj.userId) {
                        obj.userId = generateId();
                    }
                    // obj.createdAt = now;
                    // obj.updatedAt = now;
                    // obj.version = 0;
                } else {
                    console.log('will update entity...');
                    // obj.updatedAt = now;
                    // obj.version++;
                }
            }
        }
    });
}

const TYPES = ['STRING', 'INTEGER', 'BIGINT', 'TEXT', 'DOUBLE', 'DATEONLY', 'BOOLEAN', 'DECIMAL'];

var exp = {
    defineModel: defineModel,
    sync: () => {
        // only allow create ddl in non-production environment:
        if (process.env.NODE_ENV !== 'production') {
            sequelize.sync({ force: true });
        } else {
            throw new Error('Cannot sync() when NODE_ENV is set to \'production\'.');
        }
    }
};

for (let type of TYPES) {
    exp[type] = Sequelize[type];
}

exp.ID = ID_TYPE;
exp.generateId = generateId;

module.exports = exp;
