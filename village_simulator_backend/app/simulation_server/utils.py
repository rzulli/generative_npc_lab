from nanoid import generate
def global_id(size=4):
    return generate('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', size=4)