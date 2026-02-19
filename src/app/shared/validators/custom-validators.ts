import { AbstractControl, ValidatorFn, Validators } from '@angular/forms';

export function plateNumberValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (!control.value) {
      return null; 
    }
    const plateNumberRegex = /^[A-Z0-9]{1,10}$/;
    return plateNumberRegex.test(control.value) ? null : { 'invalidPlateNumber': { value: control.value } };
  };
}

export function chassisNumberValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (!control.value) {
      return null;
    }
    const chassisNumberRegex = /^[A-HJ-NPR-Z0-9]{17}$/i;
    return chassisNumberRegex.test(control.value) ? null : { 'invalidChassisNumber': { value: control.value } };
  };
}

export function vehicleYearValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (!control.value) {
      return null;
    }
    const year = parseInt(control.value, 10);
    const currentYear = new Date().getFullYear();
    return (year >= 1900 && year <= currentYear) ? null : { 'invalidVehicleYear': { value: control.value } };
  };
}

export function fiscalPowerValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (!control.value) {
      return null;
    }
    const fiscalPower = parseInt(control.value, 10);
    return (fiscalPower > 0 && fiscalPower <= 100) ? null : { 'invalidFiscalPower': { value: control.value } };
  };
}