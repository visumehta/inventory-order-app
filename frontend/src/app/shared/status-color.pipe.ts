import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusColor'
})
export class StatusColorPipe implements PipeTransform {

  transform(value: string): string {
    switch (value) {
      case 'Available':
        return 'green';
      case 'Low':
        return 'yellow';
      case 'Out of Stock':
        return 'red';
      default:
        return 'black';
    }
  }

}
