import { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Validateur qui vérifie si les champs 'password' et 'confirmPassword' correspondent.
 * Doit être utilisé sur un FormGroup.
 * @param control Le FormGroup à valider.
 * @returns Un objet d'erreur si les mots de passe ne correspondent pas, sinon null.
 */
export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  // Si les contrôles n'existent pas ou n'ont pas encore de valeur, ne pas valider.
  if (!password || !confirmPassword || !password.value || !confirmPassword.value) {
    return null;
  }

  return password.value === confirmPassword.value ? null : { passwordMismatch: true };
}