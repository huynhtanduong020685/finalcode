export class User {
    // public name: string = '';
    // public email: string = '';
    // public picture: string = '';
    // public languages: Array<string> = [];
    // public location: object = {
    //     country: '',
    //     city: ''
    // };
    // public guide_fee: string = '';
    // public meet_at_airport: boolean = false;
    // public introduciton: string = '';
    // public facebook: string = '';
    // public messenger: string = '';
    // public interest: string = '';

    public base64 : string = '';
    public city: string = '';
    public country: string = '';
    public email: string = '';
    public fb_id: string = '';
    public guide_fee: string = '';
    public homestay: {
        breakfast: string,
        description: string,
        location: string,
        picture: string,
        pictures: string,
        price: number,
        wifi: string,
    };
    public interest: string = '';
    public introduction: string = '';
    public language1: string = '';
    public language2: string = '';
    public language3: string = '';
    public meet_at_airport: string = '';
    public name: string = '';
    public online: string = '';
    public picture: string = '';
    public pictures: string = '';

    constructor() {

    }

}