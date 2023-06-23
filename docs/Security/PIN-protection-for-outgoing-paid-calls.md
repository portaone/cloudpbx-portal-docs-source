---
sidebar_position: 3
---
# PIN protection for outgoing paid calls outside of your Cloud PBX

Oftentimes, businesses require additional authorization for outgoing tolls on international calls. Especially in the case of a single phone being shared among multiple users. PIN protection can be enabled for a particular product (main or add-on) assigned to extensions.

| Contact the service provider to check if PIN protection is available for your company. |
| --- |

If you need to enforce additional authorization of outgoing paid calls for a particular extension, ask the service provider to enable it first. Then open menu "**Cloud PBX** \> **Extensions**", select the extension that requires additional authorization on outgoing paid calls outside of your Cloud PBX, and open tab "**Call settings**" to enable option "**IVR authentication**". Enter a service unblock code that a user should input to make a toll call.

![](./img/Security-PIN_protection_enabled.gif)

| Calls between Cloud PBX extensions and calls to other IVR applications (e.g., to voicemail) bypass the additional authorization. |
| --- |

Next time, this extension is used to make an outgoing paid call outside of your Cloud PBX, the user will be asked to enter a PIN code.
