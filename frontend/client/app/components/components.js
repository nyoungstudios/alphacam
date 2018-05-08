import angular from 'angular';
import Home from './home/home';
import About from './about/about';
import Auth from './auth/auth';

let componentModule = angular.module('app.components', [
  Home,
  About,
  Auth
])

.name;

export default componentModule;
