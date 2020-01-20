export class Channel{
    public name: string;
    public unread: number;

    public constructor(name: string, unread: number){
        this.name = name;
        this.unread = unread;
    }
}