# Purpose of the package
This package was created so that it can be used in nodejs as the current javascript SDK for playerioclient only works for browsers (without serious modification) so I've decided to rewrite as much essentials as I can.<br>

This package doesn't have everything, it's probably more than 50% complete but I've decided not to add more as they're no longer releveant to my needs, if they're required, feel free to create a pull request.

Benefits of using this over the SDK:
- No more callback hell --> replaced by promises.
- Connecting to the websocket server ACTUALLY works.
- Types (for the most part) works.
  - Although this isn't a typescript project, this utilises jsdoc.

## Note that this is an **incomplete** rewrite of the SDK.