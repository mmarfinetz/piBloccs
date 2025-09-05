{ pkgs }: {
  deps = [
    pkgs.python310Full
    pkgs.pip
    pkgs.nodejs-18_x
    pkgs.nodePackages.npm
    pkgs.python310Packages.flask
    pkgs.python310Packages.matplotlib
    pkgs.python310Packages.numpy
    pkgs.python310Packages.pillow
    # Add these dependencies to fix Nix env issues
    pkgs.bashInteractive
    pkgs.gcc
    pkgs.gnumake
  ];
  env = {
    PYTHONBIN = "${pkgs.python310Full}/bin/python3.10";
    LANG = "en_US.UTF-8";
    PYTHONPATH = "${pkgs.python310Packages.flask}/lib/python3.10/site-packages:${pkgs.python310Packages.matplotlib}/lib/python3.10/site-packages:${pkgs.python310Packages.numpy}/lib/python3.10/site-packages:${pkgs.python310Packages.pillow}/lib/python3.10/site-packages";
  };
} 