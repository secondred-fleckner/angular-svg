/**
 * tgp.svg v0.1 - fleckner@secondred.de
 * provides several svg relevant attribute-directives in order to prevent compile errors
 **/
(function(angular ){
    'use strict';

    var moduleName = 'tgp.svg',
        dependencies = [],
        module = angular.module(moduleName, dependencies);

    var svgAttr = [
        'fill',
        // line
        'x1', 'x2', 'y1', 'y2',
        // circle
        'cx', 'cy', 'r', 'rx', 'ry',
        // rects
        'x', 'y', 'width', 'height',
        // path
        'd', 'stroke-dasharray', 'stroke-dashoffset',
        // general
        'id'
    ];

    angular.forEach(svgAttr, function(name) {
        var tmpName = name.split('-');
        var ngName = 'svg';
        for(var n=0;n<tmpName.length;n++)
        {
            ngName = ngName + tmpName[n][0].toUpperCase() + tmpName[n].slice(1);
        }
        module.directive(ngName, function(){
            return function(scope, element, attrs) {
                attrs.$observe(ngName, function(value){
                    attrs.$set(name, value);
                });
            };
        });
    });

    module.directive('svgViewBox', function(){
        return function(scope, element, attrs) {
            attrs.$observe('svgViewBox', function(value){
                if (value != false) {
                    element.attr('viewBox', value);
                }
            });
        };
    });

    module.directive('svgHref', function(){
        return function(scope, element, attrs) {
            attrs.$observe('svgHref', function(value){
                if (value != false) {
                    element.attr('xlink:href', value);
                }
            });
        };
    });

    module.directive('svgAspectRatio', function(){
        return function(scope, element, attrs) {
            attrs.$observe('svgAspectRatio', function(value){
                element.attr('preserveAspectRatio', value);
            });
        };
    });

    module.filter('svgDonutSlice', ['svgPath', function(svgPath){
        return function(o, textPath) {

            var path = new svgPath.Path();

            var r1 = o.radius.inner;
            var r2 = o.radius.outer;
            var r3 = (angular.isNumber(textPath) ? textPath : o.radius.text);

            var cx = o.center.x;
            var cy = o.center.y;

            var offset = o.offset*360*(Math.PI/180);
            var arc = offset + o.arc*360*(Math.PI/180);

            var p1 = {x: cx + r1 * Math.cos(offset), y: cy + r1 * Math.sin(offset)};
            var p2 = {x: cx + r2 * Math.cos(offset), y: cy + r2 * Math.sin(offset)};
            var p3 = {x: cx + r2 * Math.cos(arc), y: cy + r2 * Math.sin(arc)};
            var p4 = {x: cx + r1 * Math.cos(arc), y: cy + r1 * Math.sin(arc)};

            if (angular.isDefined(textPath) && textPath > 0)
            {
                // simple line for the text
                p1 = {x: cx + r3 * Math.cos(offset), y: cy + r3 * Math.sin(offset)};
                p2 = {x: cx + r3 * Math.cos(arc), y: cy + r3 * Math.sin(arc)};

                path.addPoint(p1);
                path.addPointCustom(r3+','+r3+' 0 '+ (o.arc>0.5 ? '1' : '0') +',1 '+p2.x+','+p2.y, 'A');
            }
            else
            {
                path.addPoint(p1);
                path.addPoint(p2, 'L');

                path.addPointCustom(r2+','+r2+' 0 '+ (o.arc>0.5 ? '1' : '0') +',1 '+p3.x+','+p3.y, 'A');
                path.addPoint(p4, 'L');

                path.addPointCustom(r1+','+r1+' 0 '+ (o.arc>0.5 ? '1' : '0') +',0 '+p1.x+','+p1.y, 'A');
            }

            return path.toString();
        };
    }]);

    module.service('svgPath', function(){
        var Service = this;

        this.Path = function() {
            var self = this;

            this.closed = false;
            this.elements = new Array();

            this.Point = function(values, prefix) {
                var self = this;
                this.dots = new Array();
                this.prefix = typeof prefix != 'undefined' ? prefix : null;

                if (angular.isArray(values)) {
                    angular.forEach(values, function(v) {
                        self.dots.push(v);
                    });
                } else {
                    self.dots.push(values);
                }
            };
            this.Point.prototype.toString = function() {
                var d = new Array();
                for(var n=0; n<this.dots.length; n++) {
                    if (angular.isDefined(this.dots[n].y)) {
                    d.push( this.dots[n].x + ' ' + this.dots[n].y );
                    } else {
                        d.push( this.dots[n].x );
                    }
                }

                return (this.prefix ? this.prefix + ' ' : '') + d.join(' ');
            };

            this.close = function() {
                self.closed = true;
            };

            this.addPoint = function(points, prefix) {
                if (self.elements.length == 0) {
                    prefix = 'M';
                } /*else if (typeof prefix == 'undefined') {
                 prefix = 'L';
                 }*/
                self.elements.push( new this.Point(points, prefix) );
            };

            this.addPointCustom = function(text, prefix) {
                if (self.elements.length == 0) {
                    prefix = 'M';
                }
                self.elements.push( prefix + text );
            };
        };
        this.Path.prototype.toString = function() {
            var d = new Array();
            for(var n=0; n<this.elements.length; n++) {
                if (angular.isObject(this.elements[n])) {
                    d.push( this.elements[n].toString() );
                } else if (angular.isString(this.elements[n])) {
                    d.push( this.elements[n] );
                }
            }
            return d.join(' ');
        };

    });

    return module;
}(angular));