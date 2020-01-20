export class Message{
    public author: string;
    public created: Date;
    public text: string;

    public constructor(userName: string, message: string){
        this.author = userName;
        this.created = new Date();
        this.text = message;
    }
}