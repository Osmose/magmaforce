define(function(require) {
    var DefaultWorld = require('flux/worlds/default');
    var Graphic = require('flux/graphics/graphic');
    var Sound = require('flux/sound');

    var loader = require('game/loader');
    loader.register('warning', 'img/warning.png', 'image');
    loader.register('warning_stripe', 'img/warning_stripe.png', 'image');
    loader.register('warning_sound', 'audio/alarm.ogg', 'audio');

    var FAST_STRIPE = 6;
    var SLOW_STRIPE = 1;
    var WARNING_TOP = 80;

    function WarningWorld(ballworld) {
        DefaultWorld.call(this);
        var self = this;

        this.ballworld = ballworld;

        this.warning = new Graphic(loader.get('warning'));
        this.warning_stripe = new Graphic(loader.get('warning_stripe'));

        this.alarm = new Sound(loader.get('warning_sound'));
        this.alarm.audio.addEventListener('ended', function(e) {
            self.state = 2;
            self.alarm_playing = false;
        }, true);
        this.alarm_playing = false;

        this.stripe1x = 192;
        this.stripe2x = -this.warning_stripe.width;

        // 0 = Stripes flying in
        // 1 = Warning glow
        // 2 = Stripes flying out
        this.state = 0;
    }
    WarningWorld.prototype = Object.create(DefaultWorld.prototype);

    WarningWorld.prototype.tick = function() {
        switch (this.state) {
            case 0:
                if (this.stripe1x > 0) {
                    this.stripe1x -= FAST_STRIPE;
                    this.stripe2x += FAST_STRIPE;
                } else {
                    this.state = 1;

                    this.alarm_playing = true;
                    this.alarm.play();
                }
                break;
            case 1:
                this.stripe1x = (this.stripe1x - SLOW_STRIPE) % 32;
                this.stripe2x = ((this.stripe2x + SLOW_STRIPE) % 32) - 32;
                break;
            case 2:
                if (this.stripe2x < 192) {
                    this.stripe1x -= FAST_STRIPE;
                    this.stripe2x += FAST_STRIPE;
                } else {
                    this.engine.popWorld();
                    this.ballworld.running = true;
                    this.ballworld.start();
                    this.ballworld.ballgrid.addRow(true);
                    this.ballworld.ballgrid.addRow(true);
                    this.ballworld.ballgrid.addRow(true);
                }
        }
    };

    function flashToAlpha(progress) {
        if (progress < 0.5) {
            return progress / 0.5;
        } else if (progress < 1) {
            return 1;
        } else if (progress < 1.5) {
            return 1 - ((progress - 1) / 0.5);
        } else {
            return 0;
        }
    }

    WarningWorld.prototype.render = function(ctx) {
        switch (this.state) {
            case 0:
                // Box height is determined by how far the stripes are.
                var box_half_height = Math.floor(((192 - this.stripe1x) / 192) * 24);
                var box_top = WARNING_TOP + 24 - box_half_height;
                ctx.fillStyle = 'rgba(91, 0, 0, 0.6)';
                ctx.fillRect(0, box_top, 192, box_half_height * 2);
                break;
            case 1:
                // Tie the warning's flashing to the audio's progress.
                var audio = this.alarm.audio;
                var audio_progress = audio.currentTime / audio.duration;
                var flash_progress = (audio_progress * 8) % 2;

                ctx.fillStyle = 'rgba(91, 0, 0, 0.6)';
                ctx.fillRect(0, WARNING_TOP, 192, 48);
                console.log(flash_progress + '-' + flashToAlpha(flash_progress));
                ctx.globalAlpha = flashToAlpha(flash_progress);
                this.warning.render(ctx, 0, WARNING_TOP);
                ctx.globalAlpha = 1;
                break;
            case 2:
                var box_half_height = 24 - Math.floor(Math.max(0, (this.stripe2x / 192)) * 24);
                var box_top = WARNING_TOP + 24 - box_half_height;
                ctx.fillStyle = 'rgba(91, 0, 0, 0.6)';
                ctx.fillRect(0, box_top, 192, box_half_height * 2);

        }


        this.warning_stripe.render(ctx, this.stripe1x, WARNING_TOP);
        this.warning_stripe.render(ctx, this.stripe2x, WARNING_TOP + 40);
    };

    WarningWorld.prototype.start = function() {
        if (this.alarm_playing) {
           this.alarm.play();
        }
    };

    WarningWorld.prototype.stop = function() {
        this.alarm.pause();
    }

    return WarningWorld;
});
