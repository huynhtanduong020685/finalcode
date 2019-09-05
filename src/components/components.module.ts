import { NgModule } from '@angular/core';
import { SelectCountryComponent } from './select-country/select-country';
import { IonicModule } from 'ionic-angular';
//import { AutoCompleteModule } from 'ionic2-auto-complete';
import { RadioComponent, MdRadioGroup} from './radio/radio';
@NgModule({
	declarations: [SelectCountryComponent,
	RadioComponent,
	MdRadioGroup],
	/*imports: [IonicModule, AutoCompleteModule],*/
	imports: [IonicModule],
	entryComponents: [SelectCountryComponent],
	exports: [SelectCountryComponent,
	RadioComponent,
	MdRadioGroup]
})
export class ComponentsModule { }
