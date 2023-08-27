class Connection {
    constructor(users, group, script) {
        this.script = script;
        this.connections = this.script.connections;
        this.client = this.script.client;

        this.group = group;
        
        this.client.acceptGroupInvite(group).then(id => {
            this.groupId = id;
        });
        
        this.users = [];

        if (typeof users === 'string') {
            this.client.getNumberId(users).then(id => {
                this.users.push(id);
            });
        } else {
            for (let user of users) {
                this.client.getNumberId(user).then(id => {
                    this.users.push(id);
                });
            }
        }
    }

    async joinUser(number) {
        let id = await this.client.getNumberId(number);

        this.users.push(id);
    }
}

module.exports = ( Connection );