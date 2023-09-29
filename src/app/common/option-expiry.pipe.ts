import {
  Pipe,
  PipeTransform
} from '@angular/core';
import { ConfigService } from 'src/app/common/config.service'

@Pipe({
  name: 'optionExpiryDate'
})
export class OptionExpiryPipe implements PipeTransform {
  constructor(public configService: ConfigService) {
  }

  transform(value: any): string {
    if (value) {
      let config = this.configService.readConfig();
      if (config?.useSimulatedTrade) {
        const pattern = /(\d{2})\/(\d{2})\/(\d{4})/
        const [day, month, year] = value.match(pattern)!.slice(1)
    
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var mmm = months[parseInt(month) - 1];
    
        return day + "-" + mmm + "-" + year.slice(-2)  
      }
      else {
        const pattern = /(\d{4})(\d{2})(\d{2})/
        const [year, month, day] = value.match(pattern)!.slice(1)
    
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var mmm = months[parseInt(month) - 1];
    
        return day + "-" + mmm + "-" + year.slice(-2)  
      }
    }
    return ""
  }
}