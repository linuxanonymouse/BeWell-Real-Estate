"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamService = void 0;
const common_1 = require("@nestjs/common");
let TeamService = class TeamService {
    members = [
        { id: '1', name: 'Haris Lemene', role: 'Chief Executive Officer', department: 'Leadership' },
        { id: '2', name: 'Maryam Rose', role: 'Managing Director', department: 'Leadership' },
        { id: '3', name: 'Fahad Khan', role: 'Head of Construction', department: 'Engineering' },
        { id: '4', name: 'David Allen', role: 'Head of Architecture', department: 'Design' },
    ];
    findAll() {
        return this.members;
    }
    findOne(id) {
        return this.members.find(m => m.id === id);
    }
    create(member) {
        const newMember = { ...member, id: String(this.members.length + 1) };
        this.members.push(newMember);
        return newMember;
    }
    update(id, data) {
        const index = this.members.findIndex(m => m.id === id);
        if (index === -1)
            return undefined;
        this.members[index] = { ...this.members[index], ...data };
        return this.members[index];
    }
    delete(id) {
        const index = this.members.findIndex(m => m.id === id);
        if (index === -1)
            return false;
        this.members.splice(index, 1);
        return true;
    }
};
exports.TeamService = TeamService;
exports.TeamService = TeamService = __decorate([
    (0, common_1.Injectable)()
], TeamService);
//# sourceMappingURL=team.service.js.map