---
layout: default
title:  "Upgrade Geeetch A10 Firmware to Marlin 2.0"
categories: [3D Printing]
description: Two minute firmware upgrade instruction

---


Upgrading the firmware of the Geeetch A10 to use Marlin 2.0 is fairly simple and requires only two simple steps. 

### Step 1. Download the Marlin firmware and set it up with the right configuration for the Geeetch A10 

You can either get the latest Marlin firmware from the [official Marlin Firmware Repository](https://github.com/MarlinFirmware/Marlin){:target="_blank"} and configure it yourself by copying the configuration files for the A10 from `/config/examples/Geeetech/A10/` to `/Marlin` (and override the existing configuration). Further configuration to those files might be necessary.

Alternatively you can use [my fork of the Marlin v2.0 firmware](https://github.com/tobiasschuerg/Marlin/tree/2.0.x-Geeetech-A10){:target="_blank"} which already contains the right configuration for the Geeetch A10 and also contains a fix for the filament direction of the extruder (which was needed in my case).


### Step 2. Download the Arduino IDE and upload the new firmware to the Geeetch A10

1. First [download the Arduino IDE](https://www.arduino.cc/en/Main/Software){:target="_blank"} from the official Arduino website.
2. Connect your printer via USB
3. Open `Marlin/Marlin.ino` in the Arduino IDE
4. In `Tools > Port` select the *COM port* of the Geeetech A10
5. In `Tools > Board` select 'Arduino/Genuino Mega or Mega 2560'
6. Optional: Press `CTRL` + `R` to verify that the firmware compiles  
   (it should - if not then there is probably a wrong board selected).
7. Press `CTRL` + `U` to actually upload the new firmware to the Printer.
   (if uploading fails, there might be a wrong port selected)
   
   
### Done. Happy Printing.

Enjoy your upgraded 3D printer with the new firmware.

<img src="{{site.baseurl}}/img/geetech_a10_marlin_v2.jpg" alt="Photo of the Geeetech A10 info screen" />